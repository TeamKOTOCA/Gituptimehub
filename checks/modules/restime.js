import http from "http";
import https from "https";

/**
 * レスポンスタイムを計測
 * @param {string} url
 */
export function check_restime(url) {
    return new Promise((resolve) => {
        const lib = url.startsWith("https") ? https : http;
        const start = Date.now();

        const req = lib.get(url, (res) => {
        res.on("data", () => {}); // 受信はするが使わない
        res.on("end", () => {
            resolve({
            ok: true,
            statusCode: res.statusCode,
            timeMs: Date.now() - start,
            });
        });
        });

        req.on("error", (err) => {
        resolve({ ok: false, error: err.message });
        });

        req.setTimeout(10000, () => {
        req.destroy();
        resolve({ ok: false, error: "timeout" });
        });
    });
}
