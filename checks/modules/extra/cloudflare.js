
/**
 * Cloudflare Status API を取得（名前の完全一致で単一オブジェクトを返す）
 * @param {string} serviceName 完全一致させるサービス名 (例: "Cloudflare Workers", "Tokyo, Japan - (NRT)")
 * @returns {Promise<{ name: string, rawStatus: string, normalizedStatus: string } | null>}
 */
export async function getCloudflareStatus(serviceName) {
    if (!serviceName) return null;

    const url = "https://www.cloudflarestatus.com/api/v2/components.json";

    try {
        const res = await fetch(url, { headers: { "User-Agent": "MonitorBot/1.0" } });
        const data = await res.json();
        const components = data.components || [];

        // 完全一致 (Case-insensitive) で検索
        const comp = components.find(c => 
            !c.group && 
            c.name.toLowerCase() === serviceName.toLowerCase()
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
            case "under_maintenance":
                normalizedStatus = "degraded";
                break;
            case "major_outage":
                normalizedStatus = "down";
                break;
        }

        return { 
            name: comp.name, 
            rawStatus, 
            normalizedStatus 
        };
    } catch (e) {
        console.error("Cloudflare Status API Error:", e);
        return null;
    }
}
