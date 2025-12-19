import fetch from "node-fetch";

export async function getGcpStatus(service, region = "global") {
    const url = "https://status.cloud.google.com/incidents.json";

    try {
        const res = await fetch(url, { headers: { "User-Agent": "MonitorBot/1.0" } });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        const now = Date.now();

        // サービスが存在するかどうかを確認
        const allComponents = data.flatMap(event => event.components || []);
        const serviceExists = allComponents.some(c => c.name.toLowerCase().includes(service.toLowerCase()));

        if (!serviceExists) {
            return { service, rawStatus: "not found", normalizedStatus: "unknown" };
        }

        // 現在進行中のイベントをフィルタ
        const activeEvents = data.filter(event => {
            const matchesService = event.components?.some(c => 
                c.name.toLowerCase().includes(service.toLowerCase())
            );
            if (!matchesService) return false;

            const startTime = new Date(event.start).getTime();
            const endTime = event.end ? new Date(event.end).getTime() : null;

            return startTime <= now && (!endTime || now <= endTime);
        });

        let normalizedStatus = "operational";
        let rawStatus = "no active incidents";

        if (activeEvents.length > 0) {
            const severityPriority = { "service outage": 3, "service disruption": 2, "service information": 1 };
            const topEvent = activeEvents.reduce((prev, curr) => 
                severityPriority[curr.status_severity] > severityPriority[prev.status_severity] ? curr : prev
            );
            rawStatus = topEvent.status_severity;

            if (rawStatus === "service outage") normalizedStatus = "down";
            else if (rawStatus === "service disruption") normalizedStatus = "degraded";
            else normalizedStatus = "notice";
        }

        return { service, rawStatus, normalizedStatus };

    } catch (e) {
        return { service, rawStatus: "error", normalizedStatus: "unknown", message: e.message };
    }
}
