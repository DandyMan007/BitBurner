/** @param {NS} ns **/
export function tryRoot(ns, server) {
    if (ns.hasRootAccess(server)) return;

    let openPorts = 0;
    if (ns.fileExists("BruteSSH.exe")) { ns.brutessh(server); openPorts++; }
    if (ns.fileExists("FTPCrack.exe")) { ns.ftpcrack(server); openPorts++; }
    if (ns.fileExists("relaySMTP.exe")) { ns.relaysmtp(server); openPorts++; }
    if (ns.fileExists("HTTPWorm.exe")) { ns.httpworm(server); openPorts++; }
    if (ns.fileExists("SQLInject.exe")) { ns.sqlinject(server); openPorts++; }

    if (openPorts >= ns.getServerNumPortsRequired(server)) {
        ns.nuke(server);
        ns.print(`🔓 Rooted ${server}`);
    }
}
