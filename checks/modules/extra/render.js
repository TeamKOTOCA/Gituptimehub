import fetch from "node-fetch";

export async function getRenderStatus(service) {
    const url = "https://status.render.com/api/v2/status.json";

    try {
        const res = await fetch(url, { headers: { "User-Agent": "MonitorBot/1.0" } });
        const data = await res.json();
        const rawStatus = data.status?.description || "unknown";

        let normalizedStatus = "unknown";
        if (rawStatus.toLowerCase().includes("operational")) normalizedStatus = "operational";
        else if (rawStatus.toLowerCase().includes("degraded")) normalizedStatus = "degraded";
        else if (rawStatus.toLowerCase().includes("major")) normalizedStatus = "down";

        return { service, rawStatus, normalizedStatus };
    } catch (e) {
        return { service, rawStatus: "error", normalizedStatus: "unknown" };
    }
}
