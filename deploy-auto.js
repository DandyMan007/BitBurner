/** @param {NS} ns **/
export function deployScript(ns, host, script, targets) {
    const maxRam = ns.getServerMaxRam(host);
    const usedRam = ns.getServerUsedRam(host);
    const reservedRam = host === "home" ? 32 : 0;
    const freeRam = maxRam - usedRam - reservedRam;
    const ramPerThread = ns.getScriptRam(script);

    if (freeRam < ramPerThread) return;

    ns.killall(host);
    ns.scp(script, host);

    const totalThreads = Math.floor(freeRam / ramPerThread);
    const threadsPerTarget = Math.max(1, Math.floor(totalThreads / targets.length));

    let deployed = 0;

    for (const target of targets) {
        if (deployed + threadsPerTarget > totalThreads) break;

        ns.exec(script, host, threadsPerTarget, target);
        ns.print(`🚀 ${host} running ${threadsPerTarget} threads targeting ${target}`);
        deployed += threadsPerTarget;
    }

    const remainingThreads = totalThreads - deployed;
    if (remainingThreads > 0 && targets.length > 0) {
        ns.exec(script, host, remainingThreads, targets[0]);
        ns.print(`➕ ${host} using remaining ${remainingThreads} threads on ${targets[0]}`);
    }
}
