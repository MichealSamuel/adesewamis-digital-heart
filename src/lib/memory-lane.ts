import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MemoryKind = "photo" | "video" | "thought";

export interface MemoryCard {
  id: string;
  kind: MemoryKind;
  title: string;
  note: string;
  mediaUrl: string | null;
  mediaPath: string | null;
  createdAt: string | null;
  editable: boolean;
}

export const MEMORY_BUCKET = "memory-lane";
export const MAX_MEMORY_FILE_SIZE = 50 * 1024 * 1024;

export const starterMemories: MemoryCard[] = [
  {
    id: "starter-photo-1",
    kind: "photo",
    title: "The smile I keep",
    note: "A little piece of you that makes an ordinary day feel brighter.",
    mediaUrl: "/media/photo1.jpg",
    mediaPath: null,
    createdAt: null,
    editable: false,
  },
  {
    id: "starter-video-1",
    kind: "video",
    title: "The day that still gets me",
    note: "A favourite little moment, saved for another laugh.",
    mediaUrl: "/media/funny.mp4",
    mediaPath: null,
    createdAt: null,
    editable: false,
  },
  {
    id: "starter-photo-2",
    kind: "photo",
    title: "A soft little moment",
    note: "Some memories feel like a warm hug, even from far away.",
    mediaUrl: "/media/photo2.jpg",
    mediaPath: null,
    createdAt: null,
    editable: false,
  },
  {
    id: "starter-thought-1",
    kind: "thought",
    title: "A thought to keep",
    note: "The little things nobody else would notice are the ones I remember most.",
    mediaUrl: null,
    mediaPath: null,
    createdAt: null,
    editable: false,
  },
  {
    id: "starter-photo-3",
    kind: "photo",
    title: "My favourite face",
    note: "Exhibit C. Still unfair. 🤍",
    mediaUrl: "/media/photo3.jpg",
    mediaPath: null,
    createdAt: null,
    editable: false,
  },
  {
    id: "starter-video-2",
    kind: "video",
    title: "Another one I kept",
    note: "Press play — it still makes me smile.",
    mediaUrl: "/media/memory2.mp4",
    mediaPath: null,
    createdAt: null,
    editable: false,
  },
];

export function validateMemoryFile(
  kind: MemoryKind,
  file: Pick<File, "size" | "type"> | null,
  hasExistingMedia = false,
): string | null {
  if (kind === "thought") {
    return file ? "Thought entries are text-only." : null;
  }
  if (!file && !hasExistingMedia) {
    return kind === "photo" ? "Choose a photo to add." : "Choose a video to add.";
  }
  if (!file) return null;
  if (file.size > MAX_MEMORY_FILE_SIZE) return "Choose a file smaller than 50 MB.";
  if (kind === "photo" && !file.type.startsWith("image/")) {
    return "Choose an image file for a photo entry.";
  }
  if (kind === "video" && !file.type.startsWith("video/")) {
    return "Choose a video file for a video entry.";
  }
  return null;
}

export const memoryEntriesQuery = queryOptions({
  queryKey: ["memory-lane", "entries"],
  queryFn: async (): Promise<{ entries: MemoryCard[]; hasError: boolean }> => {
    const { data, error } = await supabase
      .from("memory_entries")
      .select("id, entry_type, title, note, media_path, created_at")
      .order("created_at", { ascending: false })
      .limit(250);

    if (error) return { entries: [], hasError: true };

    const entries = await Promise.all(
      data.map(async (row): Promise<MemoryCard> => {
        let mediaUrl: string | null = null;
        if (row.media_path) {
          const { data: signedData } = await supabase.storage
            .from(MEMORY_BUCKET)
            .createSignedUrl(row.media_path, 60 * 60);
          mediaUrl = signedData?.signedUrl ?? null;
        }

        return {
          id: row.id,
          kind: row.entry_type as MemoryKind,
          title: row.title,
          note: row.note,
          mediaUrl,
          mediaPath: row.media_path,
          createdAt: row.created_at,
          editable: true,
        };
      }),
    );

    return { entries, hasError: false };
  },
});