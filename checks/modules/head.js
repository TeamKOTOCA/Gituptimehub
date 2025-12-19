import http from "http";
import https from "https";

/**
 * HEAD リクエストで死活確認
 * @param {string} url
 */
export function check_head(url) {
    return new Promise((resolve) => {
        const lib = url.startsWith("https") ? https : http;

        const start = Date.now();
        const req = lib.request(url, { method: "HEAD", headers: { "user-agent": "Mozilla/5.0"} }, (res) => {
        resolve({
            ok: res.statusCode >= 200 && res.statusCode < 400,
            statusCode: res.statusCode,
            timeMs: Date.now() - start,
        });
        res.resume();
        });

        req.on("error", (err) => {
        resolve({ ok: false, error: err.message });
        });

        req.setTimeout(10000, () => {
        req.destroy();
        resolve({ ok: false, error: "timeout" });
        });

        req.end();
    });
}
