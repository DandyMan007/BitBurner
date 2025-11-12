/** @param {NS} ns **/
export function getAllServers(ns) {
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
