/** @param {NS} ns **/
export async function main(ns) {
    const servers = getAllServers(ns);

    for (const server of servers) {
        if (server === "home") continue; // Skip home
        if (ns.hasRootAccess(server)) {
            const files = ns.ls(server);
            for (const file of files) {
                if (file.endsWith(".js")) {
                    ns.rm(file, server);
                }
            }
        }
    }
}

// Helper to recursively scan all servers
function getAllServers(ns) {
    const visited = new Set();
    const stack = ["home"];
    while (stack.length) {
        const current = stack.pop();
        if (!visited.has(current)) {
            visited.add(current);
            for (const neighbor of ns.scan(current)) {
                stack.push(neighbor);
            }
        }
    }
    return [...visited];
}
