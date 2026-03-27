import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";

function isPrivateIPv4(address) {
  return (
    address.startsWith("10.") ||
    address.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function getLanHost() {
  const interfaces = networkInterfaces();
  const preferredNames = ["en0", "en1", "Ethernet", "Wi-Fi"];

  for (const name of preferredNames) {
    const entries = interfaces[name] ?? [];
    const match = entries.find(
      (entry) => entry.family === "IPv4" && !entry.internal && isPrivateIPv4(entry.address),
    );

    if (match) {
      return match.address;
    }
  }

  for (const entries of Object.values(interfaces)) {
    const match = (entries ?? []).find(
      (entry) => entry.family === "IPv4" && !entry.internal && isPrivateIPv4(entry.address),
    );

    if (match) {
      return match.address;
    }
  }

  return "0.0.0.0";
}

const host = getLanHost();
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(
  npxCommand,
  ["next", "dev", "-H", host],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DEV_HOST: host,
    },
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
