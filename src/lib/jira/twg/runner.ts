import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

const TWG_TIMEOUT_MS = 20_000;
const MAX_BUFFER_BYTES = 10 * 1024 * 1024;

export type TwgError = {
  code: string;
  kind?: string;
  message: string;
  statusCode?: number;
  traceId?: string;
  requestId?: string;
  retry?: { recommended: boolean; guidance?: string };
};

export type TwgRunFailure =
  | { kind: "missing_executable"; message: string }
  | { kind: "timeout"; message: string }
  | { kind: "invalid_json"; message: string; raw: string }
  | { kind: "twg_error"; error: TwgError }
  | { kind: "spawn_error"; message: string };

export type TwgRunResult<T> = { ok: true; data: T } | { ok: false; failure: TwgRunFailure };

/**
 * Resolves the twg binary location: explicit env override, then the documented
 * platform default install path, then falls back to relying on PATH (in case
 * the caller's shell/session already has it resolvable).
 */
function resolveTwgBinary(): string {
  if (process.env.TWG_BINARY_PATH) return process.env.TWG_BINARY_PATH;

  if (os.platform() === "win32") {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const candidate = path.join(localAppData, "Programs", "twg", "bin", "twg.exe");
      if (existsSync(candidate)) return candidate;
    }
  } else {
    const candidate = path.join(os.homedir(), ".local", "bin", "twg");
    if (existsSync(candidate)) return candidate;
  }

  return "twg";
}

/**
 * Runs a twg subcommand and parses its stdout as JSON. TWG CLI writes structured
 * JSON (including on failure, e.g. `{ "ok": false, "error": { "code", "message",
 * "statusCode" } }`) to stdout even when it exits non-zero, so we always attempt
 * to parse stdout rather than relying solely on the exit code.
 *
 * `-o json --output-summary none` is always appended: without `--output-summary
 * none`, twg wraps JSON output in a YAML "summary envelope" by default (file
 * paths, agent hints, etc.) instead of writing plain JSON to stdout — confirmed
 * by testing; `none` is what "emit structured output directly" actually means.
 */
export async function runTwg<T = unknown>(args: string[]): Promise<TwgRunResult<T>> {
  const binary = resolveTwgBinary();
  const fullArgs = [...args, "-o", "json", "--output-summary", "none"];

  let stdout: string;
  try {
    const result = await execFileAsync(binary, fullArgs, {
      timeout: TWG_TIMEOUT_MS,
      maxBuffer: MAX_BUFFER_BYTES,
      windowsHide: true,
    });
    stdout = result.stdout;
  } catch (err) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      killed?: boolean;
      signal?: NodeJS.Signals | null;
    };

    if (e.code === "ENOENT") {
      return {
        ok: false,
        failure: {
          kind: "missing_executable",
          message: `TWG CLI executable not found at "${binary}". Install TWG CLI or set TWG_BINARY_PATH.`,
        },
      };
    }

    if (e.killed || e.signal === "SIGTERM") {
      return {
        ok: false,
        failure: { kind: "timeout", message: `twg command timed out after ${TWG_TIMEOUT_MS}ms.` },
      };
    }

    // Non-zero exit: twg typically still writes a structured JSON error to stdout.
    stdout = e.stdout ?? "";
    if (!stdout.trim()) {
      return {
        ok: false,
        failure: {
          kind: "spawn_error",
          message: e.stderr?.trim() || e.message || "twg command failed with no output.",
        },
      };
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return {
      ok: false,
      failure: {
        kind: "invalid_json",
        message: "TWG CLI returned output that was not valid JSON.",
        raw: stdout.slice(0, 2000),
      },
    };
  }

  if (parsed && typeof parsed === "object" && "error" in parsed) {
    return { ok: false, failure: { kind: "twg_error", error: (parsed as { error: TwgError }).error } };
  }

  return { ok: true, data: parsed as T };
}
