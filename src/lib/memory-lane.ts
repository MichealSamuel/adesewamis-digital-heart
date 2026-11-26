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