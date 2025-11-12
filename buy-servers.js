/** @param {NS} ns **/
export async function main(ns) {
    const serverPrefix = "pserv-";
    const ram = 2048; // 2048GB server
    const maxServers = ns.getPurchasedServerLimit();

    for (let i = 0; i < maxServers; i++) {
        const name = `${serverPrefix}${i}`;
        if (!ns.serverExists(name)) {
            const cost = ns.getPurchasedServerCost(ram);
            if (ns.getServerMoneyAvailable("home") >= cost) {
                ns.purchaseServer(name, ram);
                ns.tprint(`✅ Purchased server: ${name} (${ram}GB)`);
            } else {
                ns.print("💸 Not enough money to buy more servers.");
                break;
            }
        }
    }
}
