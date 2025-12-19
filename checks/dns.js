import dns from "dns/promises";

/**
 * DNS 解決できるか確認
 * @param {string} hostname
 */
export async function check_dns(hostname) {
    const start = Date.now();
    try {
        const addresses = await dns.resolve(hostname);
        return {
        ok: addresses.length > 0,
        addresses,
        timeMs: Date.now() - start,
        };
    } catch (err) {
        return {
        ok: false,
        error: err.message,
        };
    }
}
