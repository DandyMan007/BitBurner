/** @param {NS} ns **/
import { deployFallback } from "fallback.js";

export async function main(ns) {
  const scriptHack = "batch-hack.js";
  const scriptGrow = "batch-grow.js";
  const scriptWeaken = "batch-weaken.js";
  const homeReserve = 128;
  const loopDelay = 5 * 60 * 1000;
  const maxTargets = 3;

  const player = ns.getPlayer();
  const allServers = scanAll(ns);

  // Auto-root servers
  for (const server of allServers) {
    if (!ns.hasRootAccess(server)) tryRoot(ns, server);
  }

  while (true) {
    const targets = getBestTargets(ns, allServers, player, maxTargets);
    const hosts = allServers.filter(s =>
      ns.hasRootAccess(s) && ns.getServerMaxRam(s) > 0
    );

    for (const target of targets) {
      const serverInfo = ns.getServer(target);
      const hackPercent = ns.formulas.hacking.hackPercent(serverInfo, player);
      const hackThreads = Math.ceil(0.1 / hackPercent); // Hack 10%
      const growThreads = Math.ceil(ns.formulas.hacking.growThreads(serverInfo, player, 1.5));

      // ✅ Use static values for security increase
      const hackSec = 0.002 * hackThreads;
      const growSec = 0.004 * growThreads;
      const weakenThreads = Math.ceil((hackSec + growSec) / ns.weakenAnalyze(1));

      const hackTime = ns.formulas.hacking.hackTime(serverInfo, player);
      const growTime = ns.formulas.hacking.growTime(serverInfo, player);
      const weakenTime = ns.formulas.hacking.weakenTime(serverInfo, player);

      const spacing = 200; // ms between scripts
      const delays = {
        weaken1: 0,
        grow: weakenTime - growTime + spacing,
        weaken2: 2 * spacing,
        hack: weakenTime - hackTime + 3 * spacing
      };

      for (const host of hosts) {
        await ns.scp([scriptHack, scriptGrow, scriptWeaken], host);

        const scriptsToKill = [scriptHack, scriptGrow, scriptWeaken];
        const running = ns.ps(host);

        for (const proc of running) {
          if (scriptsToKill.includes(proc.filename)) {
            ns.kill(proc.pid);
          }
        }


        const maxRam = ns.getServerMaxRam(host);
        const usedRam = ns.getServerUsedRam(host);
        const freeRam = host === "home" ? maxRam - usedRam - homeReserve : maxRam;

        const batchRam =
          ns.getScriptRam(scriptHack) * hackThreads +
          ns.getScriptRam(scriptGrow) * growThreads +
          ns.getScriptRam(scriptWeaken) * weakenThreads * 2;

        if (freeRam < batchRam) {
          // Fallback to simple hack script
          deployFallback(ns, host, "hack01.js", target);
          continue;
        }


        if (freeRam < batchRam) continue;

        const maxBatches = Math.floor(freeRam / batchRam);
        for (let i = 0; i < maxBatches; i++) {
          const offset = i * 4 * spacing;

          if (weakenThreads > 0)
            ns.exec(scriptWeaken, host, weakenThreads, target, delays.weaken1 + offset);
          if (growThreads > 0)
            ns.exec(scriptGrow, host, growThreads, target, delays.grow + offset);
          if (weakenThreads > 0)
            ns.exec(scriptWeaken, host, weakenThreads, target, delays.weaken2 + offset);
          if (hackThreads > 0)
            ns.exec(scriptHack, host, hackThreads, target, delays.hack + offset);

        }

        ns.print(`🚀 ${host} running ${maxBatches} batches on ${target}`);
      }
    }

    await ns.sleep(loopDelay);
  }
}

// Get top N targets based on money/sec
function getBestTargets(ns, servers, player, count) {
  return servers
    .filter(s =>
      ns.hasRootAccess(s) &&
      ns.getServerMaxMoney(s) > 0 &&
      ns.getServerRequiredHackingLevel(s) <= player.skills.hacking
    )
    .map(server => {
      const info = ns.getServer(server);
      const score = info.moneyMax * ns.formulas.hacking.hackPercent(info, player) / ns.formulas.hacking.hackTime(info, player);
      return { server, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(entry => entry.server);
}

// Rooting logic
function tryRoot(ns, server) {
  const cracks = {
    "BruteSSH.exe": ns.brutessh,
    "FTPCrack.exe": ns.ftpcrack,
    "relaySMTP.exe": ns.relaysmtp,
    "HTTPWorm.exe": ns.httpworm,
    "SQLInject.exe": ns.sqlinject
  };

  let ports = 0;
  for (const file in cracks) {
    if (ns.fileExists(file)) {
      cracksfile;
      ports++;
    }
  }

  if (ports >= ns.getServerNumPortsRequired(server)) {
    ns.nuke(server);
    ns.print(`🔓 Rooted ${server}`);
  }
}

// DFS scan
function scanAll(ns) {
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
