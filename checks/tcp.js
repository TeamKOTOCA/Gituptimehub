import net from "net";

/**
 * TCP 接続できるか確認
 * @param {string} host
 * @param {number} port
 */
export function check_tcp(host, port) {
    return new Promise((resolve) => {
        const start = Date.now();
        const socket = new net.Socket();

        socket.setTimeout(5000);

        socket.connect(port, host, () => {
        socket.destroy();
        resolve({
            ok: true,
            timeMs: Date.now() - start,
        });
        });

        socket.on("error", (err) => {
        resolve({ ok: false, error: err.message });
        });

        socket.on("timeout", () => {
        socket.destroy();
        resolve({ ok: false, error: "timeout" });
        });
    });
}
