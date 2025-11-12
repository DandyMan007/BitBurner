/** @param {NS} ns **/
export function deployFallback(ns, host, script, target) {
    const maxRam = ns.getServerMaxRam(host);
    const usedRam = ns.getServerUsedRam(host);
    const freeRam = maxRam - usedRam;
    const ramPerThread = ns.getScriptRam(script);
    const threads = Math.floor(freeRam / ramPerThread);

    if (threads < 1) return;

    ns.killall(host);
    ns.scp(script, host);
    ns.exec(script, host, threads, target);
    ns.print(`🧪 Fallback: ${host} running ${threads} threads of ${script} on ${target}`);
}
