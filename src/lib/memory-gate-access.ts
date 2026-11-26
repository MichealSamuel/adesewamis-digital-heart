export async function loadGatedGallery<T>(
  unlocked: boolean,
  loadGallery: () => Promise<T>,
): Promise<T | null> {
  if (!unlocked) return null;
  return loadGallery();
}