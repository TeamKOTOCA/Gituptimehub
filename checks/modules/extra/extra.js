import { getCloudflareStatus } from "./cloudflare.js";
import { getAwsStatus } from "./aws.js";
import { getGcpStatus } from "./gcp.js";
import { getGithubStatus } from "./github.js";
import { getRenderStatus } from "./render.js";


export async function getServiceStatus({ provider, service }) {

    try {
        let raw;
        switch (provider) {
            case "cloudflare":
                raw = await getCloudflareStatus(service);
                break;
            case "aws":
                raw = await getAwsStatus(service);
                break;
            case "gcp":
                raw = await getGcpStatus(service);
                break;
            case "github":
                raw = await getGithubStatus(service);
                break;
            case "render":
                raw = await getRenderStatus(service);
                break;
            default:
                throw new Error("Unsupported provider");
        }
                console.log(raw);

        return {
            api_status: "ok",
            status: raw,
        };

    } catch (e) {
        return {
            api_status: "error",
            status: "unknown",
        };
    }
}
