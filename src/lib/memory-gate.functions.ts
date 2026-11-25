import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import type { MemoryCard, MemoryKind } from "@/lib/memory-lane";
import { getMemoryGateSession, requireMemoryGateSession } from "@/lib/memory-gate.server";

function preventSharedCaching() {
  setResponseHeader("Cache-Control", "private, no-store");
}

function normalizePassword(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

async function passwordMatches(input: string, expected: string) {
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const inputDigest = createHash("sha256").update(normalizePassword(input), "utf8").digest();
  const expectedDigest = createHash("sha256").update(normalizePassword(expected), "utf8").digest();
  return timingSafeEqual(inputDigest, expectedDigest);
}

export const getMemoryLaneStatus = createServerFn({ method: "GET" }).handler(async () => {
  preventSharedCaching();
  const session = await getMemoryGateSession();
  return { unlocked: Boolean(session.data.unlocked) };
});

export const unlockMemoryLane = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({
    password: typeof data?.password === "string" ? data.password.slice(0, 256) : "",
  }))
  .handler(async ({ data }) => {
    preventSharedCaching();
    const expectedPassword = process.env["SITE_PASSWORD"];
    if (!expectedPassword || !data.password || data.password.length > 256) {
      return { ok: false as const };
    }

    if (!(await passwordMatches(data.password, expectedPassword))) {
      return { ok: false as const };
    }

    const session = await getMemoryGateSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockMemoryLane = createServerFn({ method: "POST" }).handler(async () => {
  preventSharedCaching();
  const session = await getMemoryGateSession();
  await session.clear();
  return { ok: true as const };
});

export const getMemoryLaneEntries = createServerFn({ method: "GET" }).handler(async () => {
  preventSharedCaching();
  await requireMemoryGateSession();

  const [{ supabaseAdmin }, { starterMemories }] = await Promise.all([
    import("@/integrations/supabase/client.server"),
    import("@/lib/starter-memories.server"),
  ]);
  const { data, error } = await supabaseAdmin
    .from("memory_entries")
    .select("id, entry_type, title, note, media_path, created_at")
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    console.error("Memory Lane entries could not be loaded.", error);
    return { entries: [] as MemoryCard[], hasError: true };
  }

  const savedMemories: MemoryCard[] = data.map((row) => ({
    id: row.id,
    kind: row.entry_type as MemoryKind,
    title: row.title,
    note: row.note,
    mediaUrl: null,
    mediaPath: row.media_path,
    createdAt: row.created_at,
    editable: true,
  }));

  const entries = await Promise.all(
    [...savedMemories, ...starterMemories].map(async (memory) => {
      if (!memory.mediaPath) return memory;
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from("memory-lane")
        .createSignedUrl(memory.mediaPath, 10 * 60);
      if (signedError) console.error("A Memory Lane media preview could not be signed.", signedError);
      return { ...memory, mediaUrl: signedData?.signedUrl ?? null };
    }),
  );

  return { entries, hasError: false };
});