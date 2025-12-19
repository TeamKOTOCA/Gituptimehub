import fs from "fs/promises";
import path from "path";

import * as httpdChecks from "./modules/http.js";
import * as headChecks from "./modules/head.js";
import * as tcpChecks from "./modules/tcp.js";
import * as dnsChecks from "./modules/dns.js";
import * as restimeChecks from "./modules/restime.js";

async function main() {
    const raw = await fs.readFile("./setting.json", "utf-8");
    const setting = JSON.parse(raw);

    let failed = false;
    const newResults = [];

    for (const target of setting.targets) {
        console.log(`\n=== ${target.name} ===`);

        const { url, host, checks } = target;
        const targetResult = { name: target.name, results: {}, time: new Date().toISOString() };

        // HTTP(GET)
        if (checks.http && url) {
            try {
                const result = await httpdChecks.check_http(url);
                console.log("http:", result);
                targetResult.results.http = result;
                if (!result.ok) failed = true;
            } catch (e) {
                targetResult.results.http = { ok: false, error: e.message };
                failed = true;
            }
        }

        // HEAD
        if (checks.head && url) {
            try {
                const result = await headChecks.check_head(url);
                console.log("head:", result);
                targetResult.results.head = result;
                if (!result.ok) failed = true;
            } catch (e) {
                targetResult.results.head = { ok: false, error: e.message };
                failed = true;
            }
        }

        // Response Time
        if (checks.restime && url) {
            try {
                const result = await restimeChecks.check_restime(url);
                console.log("restime:", result);
                targetResult.results.restime = result;
                if (!result.ok) failed = true;
            } catch (e) {
                targetResult.results.restime = { ok: false, error: e.message };
                failed = true;
            }
        }

        // DNS
        if (checks.dns && host) {
            try {
                const result = await dnsChecks.check_dns(host);
                console.log("dns:", result);
                targetResult.results.dns = result;
                if (!result.ok) failed = true;
            } catch (e) {
                targetResult.results.dns = { ok: false, error: e.message };
                failed = true;
            }
        }

        // TCP
        if (checks.tcp && host && checks.tcp.port) {
            try {
                const result = await tcpChecks.check_tcp(host, checks.tcp.port);
                console.log("tcp:", result);
                targetResult.results.tcp = result;
                if (!result.ok) failed = true;
            } catch (e) {
                targetResult.results.tcp = { ok: false, error: e.message };
                failed = true;
            }
        }

        newResults.push(targetResult);
    }

    // ---- 過去結果の読み込み ----
    const distDir = path.resolve("./dist");
    await fs.mkdir(distDir, { recursive: true });
    const outFile = path.join(distDir, "result.json");

    let history = [];
    try {
        const historyRaw = await fs.readFile(outFile, "utf-8");
        const parsed = JSON.parse(historyRaw);
        if (Array.isArray(parsed.history)) {
            history = parsed.history;
        }
    } catch (e) {
        // ファイルが無い場合や読み込みエラーは無視
    }

    // 新しい結果を追加して最新50件に制限
    history.push({ generatedAt: new Date().toISOString(), results: newResults });
    if (history.length > 50) {
        history = history.slice(-50);
    }

    // JSON に書き出し
    await fs.writeFile(
        outFile,
        JSON.stringify({ history }, null, 2)
    );
    console.log(`Results written to ${outFile}`);

    if (failed) {
        console.warn("Some checks failed, but continuing to output JSON.");
    }
}

main().catch((err) => {
    console.error("fatal:", err);
    process.exit(1);
});
