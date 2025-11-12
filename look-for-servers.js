/** @param {NS} ns **/
export async function main(ns) {
    const visited = new Set();
    const servers = [];

    function scanAll(host) {
        if (visited.has(host)) return;
        visited.add(host);
        servers.push(host);
        for (const neighbor of ns.scan(host)) {
            scanAll(neighbor);
        }
    }

    scanAll("home");
    await ns.write("servers.txt", servers.join("\n"), "w");
}
