/** @param {NS} ns **/

export function getScoredTargets(ns, servers, player = ns.getPlayer()) {
    return servers
        .filter(s =>
            ns.hasRootAccess(s) &&
            ns.getServerMaxMoney(s) > 0 &&
            ns.getServerRequiredHackingLevel(s) <= player.skills.hacking
        )
        .map(server => {
            const info = ns.getServer(server);
            const hackPercent = ns.formulas.hacking.hackPercent(info, player);
            const hackTime = ns.formulas.hacking.hackTime(info, player);
            const score = info.moneyMax * hackPercent / hackTime;
            return { server, score };
        })
        .sort((a, b) => b.score - a.score);
}

export function getTopTargets(ns, servers, count = 3, player = ns.getPlayer()) {
    return getScoredTargets(ns, servers, player)
        .slice(0, count)
        .map(entry => entry.server);
}
