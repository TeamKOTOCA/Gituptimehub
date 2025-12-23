import fs from "fs";
import path from "path";

const RESULT_DIR = "./result";

function normalizeStatus(item) {
    // provider 系
    if (item.results?.status?.normalizedStatus) {
        return item.results.status.normalizedStatus;
    }

    // self 系
    if (item.results?.head?.ok === false) return "down";
    if (item.results?.head?.statusCode >= 500) return "degraded";

    return "operational";
}

function statusClass(status) {
    return {
        operational: "se_operational",
        degraded: "se_degraded",
        down: "se_down"
    }[status] ?? "se_down";
}

export async function generateServicesHTML() {
    let html = "";

    if (!fs.existsSync(RESULT_DIR)) {
        return "<p>サービスが存在しません</p>";
    }

    const files = fs.readdirSync(RESULT_DIR)
        .filter(f => f.endsWith(".json"))
        .sort();

    if (files.length === 0) {
        return "<p>サービスが存在しません</p>";
    }

    const data = {};

    for (const file of files) {
        const json = JSON.parse(
            fs.readFileSync(path.join(RESULT_DIR, file), "utf-8")
        );

        for (const item of json.results ?? []) {
            const category = item.category ?? "uncategorized";
            const label = item.label ?? "unknown";
            const status = normalizeStatus(item);

            if (!data[category]) data[category] = {};
            if (!data[category][label]) data[category][label] = [];

            data[category][label].push(status);
        }
    }

    if (Object.keys(data).length === 0) {
        return "<p>サービスが存在しません</p>";
    }

    // HTML生成
    for (const [category, services] of Object.entries(data)) {
        html += `<div>\n<h2>${category}</h2>\n`;

        for (const [label, history] of Object.entries(services)) {
            html += `
<div class="se_content">
  <h3>${label}</h3>
  <div class="se_div">
    ${history
        .slice(-9) // 表示数制限（必要なければ削除）
        .map(s => `<div class="se_a ${statusClass(s)}"></div>`)
        .join("\n")}
  </div>
</div>
`;
        }

        html += `</div>\n`;
    }

    return html || "<p>サービスが存在しません</p>";
}
