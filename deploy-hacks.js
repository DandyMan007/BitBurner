/** @param {NS} ns **/
export async function main(ns) {
    const servers = (await ns.read("servers.txt")).split("\n");
    const script = "hack01.js";

    // Filter and sort hackable servers
    const hackable = servers.filter(s =>
        ns.hasRootAccess(s) &&
        ns.getServerMaxMoney(s) > 0 &&
        ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel()
    ).sort((a, b) => {
        const valueA = ns.getServerMaxMoney(a) / ns.getServerMinSecurityLevel(a);
        const valueB = ns.getServerMaxMoney(b) / ns.getServerMinSecurityLevel(b);
        return valueB - valueA;
    });

    const bestTarget = hackable[0] || "n00dles";

    for (const server of servers) {
        if (!ns.hasRootAccess(server)) continue;

        const maxRam = ns.getServerMaxRam(server);
        const usedRam = ns.getServerUsedRam(server);
        const freeRam = maxRam - usedRam;
        const scriptRam = ns.getScriptRam(script);
        const threads = Math.floor(freeRam / scriptRam);

        if (threads > 0) {
            await ns.scp(script, server);
            const target = server === "home" ? bestTarget : server;
            ns.exec(script, server, threads, target);
        }
    }
}
