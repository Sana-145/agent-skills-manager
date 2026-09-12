// instrumentation.ts (project root, same level as next.config.ts)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (!("Temporal" in globalThis)) {
      const { Temporal } = await import("@js-temporal/polyfill");
      (globalThis as any).Temporal = Temporal;
    }
  }
}