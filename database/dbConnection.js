import { execFile } from "node:child_process";
import dns from "node:dns/promises";
import { promisify } from "node:util";
import mongoose from "mongoose";
import logger from "../config/logger.js";

const execFileAsync = promisify(execFile);
const retryableDnsErrors = new Set([
  "ECONNREFUSED",
  "EAI_AGAIN",
  "ESERVFAIL",
  "ETIMEOUT",
]);

let connectionPromise;
let listenersRegistered = false;

const normalizePowerShellJson = (stdout) => {
  const value = JSON.parse(stdout.trim());
  return Array.isArray(value) ? value : [value];
};

const resolveSrvWithWindowsDns = async (hostname) => {
  if (!/^[a-z0-9.-]+$/i.test(hostname)) {
    throw new Error("MongoDB SRV hostname contains invalid characters");
  }

  const srvScript = [
    "$ErrorActionPreference = 'Stop';",
    `@(Resolve-DnsName -Name '_mongodb._tcp.${hostname}' -Type SRV |`,
    "Where-Object { $_.Type -eq 'SRV' } |",
    "ForEach-Object {",
    "[pscustomobject]@{ name = $_.NameTarget.TrimEnd('.'); port = $_.Port }",
    "}) | ConvertTo-Json -Compress",
  ].join(" ");

  const txtScript = [
    "$ErrorActionPreference = 'Stop';",
    `@(Resolve-DnsName -Name '${hostname}' -Type TXT |`,
    "Where-Object { $_.Type -eq 'TXT' } |",
    "ForEach-Object { $_.Strings -join '' }) | ConvertTo-Json -Compress",
  ].join(" ");

  const options = {
    windowsHide: true,
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
  };

  const [{ stdout: srvOutput }, { stdout: txtOutput }] = await Promise.all([
    execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", srvScript],
      options,
    ),
    execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", txtScript],
      options,
    ),
  ]);

  const records = normalizePowerShellJson(srvOutput).filter(
    (record) => record?.name && Number.isInteger(record?.port),
  );

  if (records.length === 0) {
    throw new Error(`No MongoDB SRV records were found for ${hostname}`);
  }

  const txtRecords = txtOutput.trim()
    ? normalizePowerShellJson(txtOutput).filter(Boolean)
    : [];

  return { records, txtRecords };
};

const createDirectUri = (srvUri, records, txtRecords) => {
  const match = srvUri.match(
    /^mongodb\+srv:\/\/([^@]+)@([^/?#]+)(\/[^?#]*)?(?:\?([^#]*))?$/i,
  );

  if (!match) {
    throw new Error("MONGODB_URI is not a valid authenticated MongoDB SRV URI");
  }

  const [, credentials, , path = "/", uriQuery = ""] = match;
  const query = new URLSearchParams();

  for (const txtRecord of txtRecords) {
    for (const [key, value] of new URLSearchParams(txtRecord)) {
      query.set(key, value);
    }
  }

  for (const [key, value] of new URLSearchParams(uriQuery)) {
    query.set(key, value);
  }

  query.set("tls", "true");

  const hosts = records
    .map(({ name, port }) => `${name}:${port}`)
    .join(",");

  return `mongodb://${credentials}@${hosts}${path}?${query.toString()}`;
};

const resolveMongoUri = async (mongoUri) => {
  if (!mongoUri.toLowerCase().startsWith("mongodb+srv://")) {
    return mongoUri;
  }

  const match = mongoUri.match(/^mongodb\+srv:\/\/(?:[^@]+@)?([^/?#]+)/i);
  const hostname = match?.[1];

  if (!hostname) {
    throw new Error("MONGODB_URI contains an invalid SRV hostname");
  }

  try {
    await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
    return mongoUri;
  } catch (error) {
    const canUseWindowsFallback =
      process.platform === "win32" && retryableDnsErrors.has(error.code);

    if (!canUseWindowsFallback) {
      throw error;
    }

    logger.warn(
      `Node DNS could not resolve MongoDB SRV records (${error.code}); using Windows DNS fallback`,
    );

    const { records, txtRecords } = await resolveSrvWithWindowsDns(hostname);
    return createDirectUri(mongoUri, records, txtRecords);
  }
};

const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on("error", (error) => {
    logger.error(`MongoDB connection error: ${error.message}`, {
      errorName: error.name,
      stack: error.stack,
    });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });
};

const dbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not configured");
    }

    registerConnectionListeners();

    const resolvedUri = await resolveMongoUri(mongoUri);
    const options = {
      dbName: process.env.DB_NAME || "isamc_db",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      family: 4,
      retryWrites: true,
      w: "majority",
    };

    await mongoose.connect(resolvedUri, options);
    logger.info("Connected to database successfully");
    return mongoose.connection;
  })();

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    logger.error(`Database connection failed: ${error.message}`, {
      errorName: error.name,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    logger.info("Database connection closed through app termination");
    process.exit(0);
  } catch (error) {
    logger.error(`Error during database disconnection: ${error.message}`, {
      stack: error.stack,
    });
    process.exit(1);
  }
});

export default dbConnection;
