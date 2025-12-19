import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export async function getAwsStatus(service) {
    // AWSは現在「Health Dashboard」に移行していますが、このURLもまだ機能します
    const url = "https://status.aws.amazon.com/";
    
    try {
        const res = await fetch(url, { 
            headers: { "User-Agent": "Mozilla/5.0 (MonitorBot/1.0)" } 
        });

        if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`);

        const text = await res.text();
        const dom = new JSDOM(text);
        const document = dom.window.document;

        // すべてのテーブル行を取得
        const rows = Array.from(document.querySelectorAll("tr"));

        // サービス名が含まれている行を探す（部分一致に対応）
        const svcRow = rows.find(row => {
            const firstCell = row.querySelector("td");
            return firstCell?.textContent?.trim().toLowerCase().includes(service.toLowerCase());
        });

        if (!svcRow) {
            return { service, rawStatus: "not found", normalizedStatus: "unknown" };
        }

        // 2番目のセル（ステータス）を取得
        const cells = svcRow.querySelectorAll("td");
        const rawStatus = cells[1]?.textContent?.trim().toLowerCase() || "unknown";

        // 正規化ロジック
        let normalizedStatus = "unknown";
        if (rawStatus.includes("normally")) {
            normalizedStatus = "operational";
        } else if (rawStatus.includes("degraded") || rawStatus.includes("performance")) {
            normalizedStatus = "degraded";
        } else if (rawStatus.includes("outage") || rawStatus.includes("disruption")) {
            normalizedStatus = "down";
        }

        return { service, rawStatus, normalizedStatus };

    } catch (error) {
        return { service, error: error.message, normalizedStatus: "error" };
    }
}