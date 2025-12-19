import fs from "fs/promises";
import path from "path";

import * as httpdChecks from "./checks/http.js";
import * as headChecks from "./checks/head.js";
import * as tcpChecks from "./checks/tcp.js";
import * as dnsChecks from "./checks/dns.js";
import * as restimeChecks from "./checks/restime.js";

async function main() {
    const raw = await fs.readFile("./setting.json", "utf-8");
    const setting = JSON.parse(raw);

    let failed = false;
    const results = [];

    for (const target of setting.targets) {
        console.log(`\n=== ${target.name} ===`);

        const { url, host, checks } = target;
        const targetResult = { name: target.name, results: {}, time: new Date().toISOString() };

        // HTTP(GET)
        if (checks.http && url) {
            const result = await httpdChecks.checkHttp(url);
            console.log("http:", result);
            targetResult.results.http = result;
            if (!result.ok) failed = true;
        }

        // HEAD
        if (checks.head && url) {
            const result = await headChecks.checkHead(url);
            console.log("head:", result);
            targetResult.results.head = result;
            if (!result.ok) failed = true;
        }

        // Response Time
        if (checks.restime && url) {
            const result = await restimeChecks.checkResponseTime(url);
            console.log("restime:", result);
            targetResult.results.restime = result;
            if (!result.ok) failed = true;
        }

        // DNS
        if (checks.dns && host) {
            const result = await dnsChecks.checkDns(host);
            console.log("dns:", result);
            targetResult.results.dns = result;
            if (!result.ok) failed = true;
        }

        // TCP
        if (checks.tcp && host && checks.tcp.port) {
            const result = await tcpChecks.checkTcp(host, checks.tcp.port);
            console.log("tcp:", result);
            targetResult.results.tcp = result;
            if (!result.ok) failed = true;
        }

        results.push(targetResult);
    }

    // ---- gh-pages 用 JSON ファイル書き出し ----
    const distDir = path.resolve("./dist");
    await fs.mkdir(distDir, { recursive: true });
    const outFile = path.join(distDir, "result.json");
    await fs.writeFile(
        outFile,
        JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)
    );
    console.log(`Results written to ${outFile}`);

    if (failed) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("fatal:", err);
    process.exit(1);
});
