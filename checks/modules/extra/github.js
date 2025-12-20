export async function getStatus(serviceName) {
    try {
        if (!serviceName) return null;

        const res = await fetch("https://www.githubstatus.com/api/v2/components.json");
        if (!res.ok) return null;

        const data = await res.json();
        if (!data?.components) return null;

        const comp = data.components.find(c =>
        c.name.toLowerCase().includes(serviceName.toLowerCase())
        );

        if (!comp) return null;

        const rawStatus = comp.status;
        let normalizedStatus = "unknown";

        switch (rawStatus.toLowerCase()) {
            case "operational":
                normalizedStatus = "operational";
                break;
            case "degraded_performance":
            case "partial_outage":
                normalizedStatus = "degraded";
                break;
            case "major_outage":
                normalizedStatus = "down";
                break;
        }

        return {
            name: comp.name,
            normalizedStatus
        };
    } catch (err) {
        return null;
    }
}
