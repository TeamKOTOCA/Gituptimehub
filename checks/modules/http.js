import https from "https";
import http from "http";

/**
 * URL にリクエストして HTTP ステータスコードを返す
 * @param {string} url
 * @returns {Promise<number|null>} ステータスコード（失敗時は null）
 */
export function check_http(url) {
return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;

    const req = lib.get(url, (res) => {
        resolve(res.statusCode);
        res.resume();
    });

    req.on("error", () => {
        resolve(null);
    });

    req.setTimeout(10000, () => {
        req.destroy();
        resolve(null);
    });
});
}