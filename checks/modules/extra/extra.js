const PROVIDERS = {
    cloudflare: async () => import("./cloudflare.js"),
    github: async () => import("./github.js"),
};

export async function getServiceStatus({ provider, service }) {
    try {
        const loader = PROVIDERS[provider];
        if (!loader) {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        const mod = await loader();

        if (typeof mod.getStatus !== "function") {
            throw new Error(`Provider ${provider} has no getStatus()`);
        }

        const raw = await mod.getStatus(service);
        console.log(raw);
        if(raw == null){
            return {
                ok: false,
                provider,
                status: "unknown",
                error: e.message,
            };
        }

        return {
            ok: true,
            provider,
            status: raw,
        };

    } catch (e) {
        return {
            ok: false,
            provider,
            status: "unknown",
            error: e.message,
        };
    }
}
