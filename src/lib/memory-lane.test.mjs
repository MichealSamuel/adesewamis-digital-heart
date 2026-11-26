import { describe, expect, it } from "bun:test";
import { MAX_MEMORY_FILE_SIZE, validateMemoryFile } from "./memory-lane.ts";
import { loadGatedGallery } from "./memory-gate-access.ts";

describe("memory upload validation", () => {
  it("accepts files up to the 50 MB storage limit", () => {
    expect(validateMemoryFile("photo", { size: MAX_MEMORY_FILE_SIZE, type: "image/jpeg" })).toBeNull();
  });

  it("rejects files larger than 50 MB", () => {
    expect(
      validateMemoryFile("video", { size: MAX_MEMORY_FILE_SIZE + 1, type: "video/mp4" }),
    ).toBe("Choose a file smaller than 50 MB.");
  });

  it("requires the matching media kind and a file for new photo and video entries", () => {
    expect(validateMemoryFile("photo", null)).toBe("Choose a photo to add.");
    expect(validateMemoryFile("video", null)).toBe("Choose a video to add.");
    expect(validateMemoryFile("photo", { size: 10, type: "video/mp4" })).toBe(
      "Choose an image file for a photo entry.",
    );
  });

  it("allows thoughts without media and existing media when editing", () => {
    expect(validateMemoryFile("thought", null)).toBeNull();
    expect(validateMemoryFile("video", null, true)).toBeNull();
  });
});

describe("private gallery access", () => {
  it("does not load gallery entries until the shared gate is unlocked", async () => {
    let fetchCount = 0;
    const lockedResult = await loadGatedGallery(false, async () => {
      fetchCount += 1;
      return ["private memory"];
    });

    expect(lockedResult).toBeNull();
    expect(fetchCount).toBe(0);

    const unlockedResult = await loadGatedGallery(true, async () => {
      fetchCount += 1;
      return ["private memory"];
    });

    expect(unlockedResult).toEqual(["private memory"]);
    expect(fetchCount).toBe(1);
  });
});