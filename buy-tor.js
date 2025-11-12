/** @param {NS} ns **/
export async function main(ns) {
    // Step 1: Buy TOR router if not owned
    if (!ns.getPlayer().tor) {
        if (ns.getServerMoneyAvailable("home") >= 200000) {
            ns.purchaseTor();
            ns.print("🛒 Purchased TOR router.");
        } else {
            ns.print("💸 Not enough money for TOR router.");
        }
    }

    // Step 2: Buy Dark Web programs
    const programs = [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe",
        "DeepscanV1.exe",
        "DeepscanV2.exe",
        "ServerProfiler.exe",
        "AutoLink.exe",
        "Formulas.exe"
    ];

    for (const program of programs) {
        if (!ns.fileExists(program, "home")) {
            const cost = ns.getDarkwebProgramCost(program);
            if (cost !== null && ns.getServerMoneyAvailable("home") >= cost) {
                ns.purchaseProgram(program);
                ns.print(`💾 Purchased ${program}`);
            }
        }
    }
}
