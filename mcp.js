/** @param {NS} ns **/
import { getNetworkNodes } from "network-utils.js";
import { tryRoot } from "root.js";
import { deployScript } from "deploy-auto.js";
import { getFilteredTargets } from "find-targets.js";

export async function main(ns) {
    const script = "hack01.js";
    const allServers = getNetworkNodes(ns);
    const purchased = ns.getPurchasedServers();
    const player = ns.getPlayer();

    let batchTargets = [];
    if (ns.fileExists("batch-targets.txt")) {
        try {
            batchTargets = JSON.parse(ns.read("batch-targets.txt"));
        } catch (e) {
            ns.print("⚠️ Failed to parse batch-targets.txt");
        }
    }

    const targets = getFilteredTargets(ns, allServers, batchTargets, player).map(t => t.server);
    if (targets.length === 0) {
        ns.tprint("⚠️ No valid non-batch targets found.");
        return;
    }

    for (const host of [...allServers, ...purchased]) {
        if (host === "home") continue;

        tryRoot(ns, host);
        if (!ns.hasRootAccess(host)) continue;

        const running = ns.ps(host);
        const isBusy = running.some(proc =>
            ["batch-hack.js", "batch-grow.js", "batch-weaken.js", script].includes(proc.filename)
        );
        if (isBusy) continue;

        await deployScript(ns, host, script, targets);
        await ns.sleep(10);
    }

    ns.tprint("✅ Smart deployment of hack01.js complete.");
}
