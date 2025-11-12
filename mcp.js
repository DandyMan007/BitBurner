/** @param {NS} ns **/
import { getAllServers } from "find-servers.js";
import { tryRoot } from "root.js";
import { deployScript } from "deploy-auto.js";
import { getScoredTargets } from "find-targets.js";

export async function main(ns) {
  const script = "hack01.js";
  const allServers = getAllServers(ns);
  const purchased = ns.getPurchasedServers();

  // Get all valid targets
  const targets = allServers.filter(s =>
    ns.hasRootAccess(s) &&
    ns.getServerMaxMoney(s) > 0 &&
    ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel()
  );

  if (targets.length === 0) {
    ns.print("⚠️ No valid targets found.");
    return;
  }

  for (const host of [...allServers, ...purchased]) {
    if (host === "home") continue;

    tryRoot(ns, host);
    if (!ns.hasRootAccess(host)) continue;

    deployScript(ns, host, script, targets);
    await ns.sleep(10);
  }

  ns.print("✅ RAM-aware multi-target deployment complete.");
}
