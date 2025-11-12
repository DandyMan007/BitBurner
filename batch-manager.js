/** @param {NS} ns **/
import { deployFallback } from "fallback.js";
import { getTopTargets } from "find-targets.js";
import { getNetworkNodes } from "network-utils.js";


export async function main(ns) {
    const scriptHack = "batch-hack.js";
    const scriptGrow = "batch-grow.js";
    const scriptWeaken = "batch-weaken.js";
    const homeReserve = 128;
    const loopDelay = 5 * 60 * 1000;
    const maxTargets = 3;

    const player = ns.getPlayer();
    const allServers = getNetworkNodes(ns);

    // Auto-root servers
    for (const server of allServers) {
        if (!ns.hasRootAccess(server)) tryRoot(ns, server);
    }

    while (true) {
        const targets = getTopTargets(ns, allServers, maxTargets, player);

        // Save targets for mcp.js to avoid
        await ns.write("batch-targets.txt", JSON.stringify(targets), "w");

        const hosts = allServers.filter(s =>
            ns.hasRootAccess(s) && ns.getServerMaxRam(s) > 0
        );

        for (const target of targets) {
            const serverInfo = ns.getServer(target);
            const hackPercent = ns.formulas.hacking.hackPercent(serverInfo, player);
            const hackThreads = Math.ceil(0.1 / hackPercent); // Hack 10%
            const growThreads = Math.ceil(ns.formulas.hacking.growThreads(serverInfo, player, 1.5));
            const hackSec = 0.002 * hackThreads;
            const growSec = 0.004 * growThreads;
            const weakenThreads = Math.ceil((hackSec + growSec) / ns.weakenAnalyze(1));

            const hackTime = ns.formulas.hacking.hackTime(serverInfo, player);
            const growTime = ns.formulas.hacking.growTime(serverInfo, player);
            const weakenTime = ns.formulas.hacking.weakenTime(serverInfo, player);

            const spacing = 200;
            const delays = {
                weaken1: 0,
                grow: weakenTime - growTime + spacing,
                weaken2: 2 * spacing,
                hack: weakenTime - hackTime + 3 * spacing
            };

            for (const host of hosts) {
                await ns.scp([scriptHack, scriptGrow, scriptWeaken], host);

                const running = ns.ps(host);
                for (const proc of running) {
                    if ([scriptHack, scriptGrow, scriptWeaken].includes(proc.filename)) {
                        ns.kill(proc.pid);
                    }
                }

                const maxRam = ns.getServerMaxRam(host);
                const usedRam = ns.getServerUsedRam(host);
                const freeRam = host === "home" ? maxRam - usedRam - homeReserve : maxRam;

                const batchRam =
                    ns.getScriptRam(scriptHack) * hackThreads +
                    ns.getScriptRam(scriptGrow) * growThreads +
                    ns.getScriptRam(scriptWeaken) * weakenThreads * 2;

                if (freeRam < batchRam) {
                    deployFallback(ns, host, "hack01.js", target);
                    continue;
                }

                const maxBatches = Math.floor(freeRam / batchRam);
                for (let i = 0; i < maxBatches; i++) {
                    const offset = i * 4 * spacing;

                    if (weakenThreads > 0)
                        ns.exec(scriptWeaken, host, weakenThreads, target, delays.weaken1 + offset);
                    if (growThreads > 0)
                        ns.exec(scriptGrow, host, growThreads, target, delays.grow + offset);
                    if (weakenThreads > 0)
                        ns.exec(scriptWeaken, host, weakenThreads, target, delays.weaken2 + offset);
                    if (hackThreads > 0)
                        ns.exec(scriptHack, host, hackThreads, target, delays.hack + offset);
                }

                ns.print(`🚀 ${host} running ${maxBatches} batches on ${target}`);
            }
        }

        await ns.sleep(loopDelay);
    }
}

// ... tryRoot and scanAll remain unchanged ...
