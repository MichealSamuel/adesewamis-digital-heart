import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  Camera,
  Film,
  ImagePlus,
  LockKeyhole,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CleanVideo } from "@/components/birthday/CleanVideo";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import {
  memoryEntriesQuery,
  MEMORY_BUCKET,
  starterMemories,
  validateMemoryFile,
  type MemoryCard,
  type MemoryKind,
} from "@/lib/memory-lane";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adesewami’s Memory Lane — Pixel-Art Scrapbook" },
      {
        name: "description",
        content: "A tiny pixel-art scrapbook for Adesewami’s favourite photos, videos, and thoughts.",
      },
      { property: "og:title", content: "Adesewami’s Memory Lane — Pixel-Art Scrapbook" },
      {
        property: "og:description",
        content: "A tiny pixel-art scrapbook for Adesewami’s favourite photos, videos, and thoughts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Adesewami’s Memory Lane — Pixel-Art Scrapbook" },
      {
        name: "twitter:description",
        content: "A tiny pixel-art scrapbook for Adesewami’s favourite photos, videos, and thoughts.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(memoryEntriesQuery),
  component: MemoryLane,
});

type FilterKind = "all" | MemoryKind;

const filters: { kind: FilterKind; label: string }[] = [
  { kind: "all", label: "ALL" },
  { kind: "photo", label: "PHOTOS" },
  { kind: "video", label: "VIDEOS" },
  { kind: "thought", label: "THOUGHTS" },
];

const kinds: { kind: MemoryKind; label: string; icon: typeof Camera }[] = [
  { kind: "photo", label: "PHOTO", icon: Camera },
  { kind: "video", label: "VIDEO", icon: Film },
  { kind: "thought", label: "THOUGHT", icon: Quote },
];

function MemoryLane() {
  const { data: savedData } = useSuspenseQuery(memoryEntriesQuery);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKind>("all");
  const [isOwner, setIsOwner] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MemoryCard | null>(null);
  const [deleting, setDeleting] = useState<MemoryCard | null>(null);
  const [kind, setKind] = useState<MemoryKind>("photo");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);

  useEffect(() => {
    let active = true;

    const refreshIdentity = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        setIsOwner(false);
        setOwnerEmail(null);
        setAuthReady(true);
        return;
      }

      const { data: role, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setOwnerEmail(data.user.email ?? null);
      setIsOwner(!roleError && role?.role === "admin");
      setAuthReady(true);
    };

    void refreshIdentity();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setIsOwner(false);
        setOwnerEmail(null);
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        window.setTimeout(() => void refreshIdentity(), 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const memories = useMemo(
    () => [...savedData.entries, ...starterMemories],
    [savedData.entries],
  );
  const visibleMemories = useMemo(
    () => (filter === "all" ? memories : memories.filter((memory) => memory.kind === filter)),
    [filter, memories],
  );

  const openNewMemory = useCallback(() => {
    setEditing(null);
    setKind("photo");
    setTitle("");
    setNote("");
    setFile(null);
    setNotice("");
    setFormOpen(true);
  }, []);

  const openEditMemory = useCallback((memory: MemoryCard) => {
    setEditing(memory);
    setKind(memory.kind);
    setTitle(memory.title);
    setNote(memory.note);
    setFile(null);
    setNotice("");
    setFormOpen(true);
  }, []);

  const handleOwnerSignIn = async () => {
    setAuthBusy(true);
    setNotice("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setNotice("Google sign-in did not complete. Please try again.");
        setNoticeError(true);
        setAuthBusy(false);
        return;
      }
      if (!result.redirected) setAuthBusy(false);
    } catch {
      setNotice("Google sign-in did not complete. Please try again.");
      setNoticeError(true);
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setNotice("Could not sign out just yet. Please try again.");
      setNoticeError(true);
      return;
    }
    setIsOwner(false);
    setOwnerEmail(null);
    await queryClient.invalidateQueries({ queryKey: memoryEntriesQuery.queryKey });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setNotice("Give this memory a title first.");
      setNoticeError(true);
      return;
    }

    const fileError = validateMemoryFile(kind, file, Boolean(editing?.mediaPath));
    if (fileError) {
      setNotice(fileError);
      setNoticeError(true);
      return;
    }

    setSaving(true);
    setNotice("");
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setNotice("Sign in with the owner account to save a memory.");
      setNoticeError(true);
      setSaving(false);
      return;
    }

    let uploadedPath: string | null = null;
    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100) || "memory-file";
      uploadedPath = `${userData.user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(MEMORY_BUCKET)
        .upload(uploadedPath, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setNotice("That file could not be uploaded. Please try again.");
        setNoticeError(true);
        setSaving(false);
        return;
      }
    }

    const mediaPath = kind === "thought" ? null : uploadedPath ?? editing?.mediaPath ?? null;
    const values = { entry_type: kind, title: cleanTitle, note: note.trim(), media_path: mediaPath };
    const { error: saveError } = editing
      ? await supabase.from("memory_entries").update(values).eq("id", editing.id)
      : await supabase.from("memory_entries").insert({ ...values, created_by: userData.user.id });

    if (saveError) {
      if (uploadedPath) await supabase.storage.from(MEMORY_BUCKET).remove([uploadedPath]);
      setNotice("This account cannot save that memory, or the connection was interrupted.");
      setNoticeError(true);
      setSaving(false);
      return;
    }

    if (editing?.mediaPath && editing.mediaPath !== mediaPath) {
      await supabase.storage.from(MEMORY_BUCKET).remove([editing.mediaPath]);
    }

    await queryClient.invalidateQueries({ queryKey: memoryEntriesQuery.queryKey });
    setFormOpen(false);
    setSaving(false);
    setFile(null);
    setNotice(editing ? "Memory updated." : "Memory added to the scrapbook.");
    setNoticeError(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("memory_entries").delete().eq("id", deleting.id);
    if (error) {
      setNotice("This memory could not be removed. Please try again.");
      setNoticeError(true);
      return;
    }

    let fileCleanupFailed = false;
    if (deleting.mediaPath) {
      const { error: removeError } = await supabase.storage
        .from(MEMORY_BUCKET)
        .remove([deleting.mediaPath]);
      fileCleanupFailed = Boolean(removeError);
    }

    await queryClient.invalidateQueries({ queryKey: memoryEntriesQuery.queryKey });
    setDeleting(null);
    setNotice(fileCleanupFailed ? "Memory removed. Its old media file could not be cleared." : "Memory removed.");
    setNoticeError(fileCleanupFailed);
  };

  return (
    <main className="min-h-screen px-4 pb-10 pt-4 text-foreground sm:px-8 sm:pt-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <a href="#top" className="group inline-flex items-center gap-3" aria-label="Memory Lane home">
            <span className="pixel-mark grid size-11 place-items-center text-primary" aria-hidden="true">
              <Sparkles className="size-5" />
            </span>
            <span>
              <span className="pixel-micro block text-foreground">MEMORY LANE</span>
              <span className="mt-1 block text-[10px] text-muted-foreground">ADESewami’s scrapbook</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <span className="hidden items-center gap-2 text-xs text-accent sm:inline-flex">
                  <LockKeyhole className="size-3.5" /> OWNER MODE
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleSignOut()}
                  className="pixel-action"
                  aria-label="Sign out of the owner account"
                >
                  <LogOut /> <span>Sign out</span>
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleOwnerSignIn()}
                disabled={authBusy}
                className="pixel-action"
                aria-label="Sign in with Google as the gallery owner"
              >
                <LogIn /> <span>{authBusy ? "Connecting…" : "Owner sign in"}</span>
              </Button>
            )}
          </div>
        </header>

        <section id="top" className="pixel-hero pixel-panel mb-10 grid overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-10 lg:p-12">
            <p className="pixel-kicker mb-5 inline-flex items-center gap-2 text-accent">
              <span className="pixel-blink" aria-hidden="true">■</span> SAVE SLOT 01 / ALWAYS OPEN
            </p>
            <h1 className="pixel-title max-w-xl text-[2rem] leading-[1.45] text-primary sm:text-5xl">
              MEMORY<br />
              <span className="text-foreground">LANE</span>
            </h1>
            <p className="mt-6 max-w-lg font-sans text-sm leading-7 text-muted-foreground sm:text-base">
              A little world for Adesewami’s favourite faces, funny clips, and thoughts worth keeping.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="secondary" className="pixel-action">
                <a href="#collection">
                  Open scrapbook <ArrowDown aria-hidden="true" />
                </a>
              </Button>
              {isOwner && (
                <Button type="button" onClick={openNewMemory} className="pixel-action">
                  <Plus aria-hidden="true" /> Add a memory
                </Button>
              )}
            </div>
            <div className="mt-9 flex items-center gap-3 border-t-2 border-border pt-4 font-sans text-[11px] text-muted-foreground">
              <span className="pixel-dot bg-primary" />
              <span>{memories.length.toString().padStart(2, "0")} SAVED MOMENTS</span>
              <span aria-hidden="true">/</span>
              <span>EST. IN LOVE</span>
            </div>
          </div>
          <figure className="pixel-hero-art relative m-4 min-h-72 overflow-hidden sm:m-6 lg:min-h-[27rem]">
            <img
              src="/media/photo3.jpg"
              alt="Adesewami smiling in a playful selfie"
              width={720}
              height={900}
              fetchPriority="high"
              className="h-full min-h-72 w-full object-cover object-center"
            />
            <div className="pixel-photo-overlay" aria-hidden="true" />
            <figcaption className="pixel-photo-caption">
              <span className="pixel-micro">PLAYER ONE</span>
              <span className="font-sans text-xs">Adesewami · forever my favourite</span>
            </figcaption>
            <span className="pixel-photo-stamp pixel-micro" aria-hidden="true">♡ SAVE</span>
          </figure>
        </section>

        <section id="collection" className="scroll-mt-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="pixel-kicker text-secondary">FILE SELECT // 001</p>
              <h2 className="pixel-section-title mt-3 text-foreground">The scrapbook</h2>
              <p className="mt-3 font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
                Little moments, kept close.
              </p>
            </div>
            {isOwner && (
              <Button type="button" onClick={openNewMemory} className="pixel-action">
                <ImagePlus aria-hidden="true" /> Add memory
              </Button>
            )}
          </div>

          <div className="mb-6 flex flex-col gap-4 border-y-2 border-border py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Filter memories">
              {filters.map((item) => (
                <Button
                  key={item.kind}
                  type="button"
                  variant={filter === item.kind ? "default" : "ghost"}
                  aria-pressed={filter === item.kind}
                  onClick={() => setFilter(item.kind)}
                  className="pixel-filter"
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <p className="font-sans text-[11px] text-muted-foreground">
              {visibleMemories.length.toString().padStart(2, "0")} ITEMS FOUND
            </p>
          </div>

          {savedData.hasError && (
            <p role="status" className="pixel-notice mb-5">
              Your saved memories couldn’t load just now. The original scrapbook is still here.
            </p>
          )}
          {notice && (
            <p role={noticeError ? "alert" : "status"} className={`pixel-notice mb-5 ${noticeError ? "pixel-notice-error" : ""}`}>
              {notice}
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleMemories.map((memory, index) => (
              <MemoryTile
                key={memory.id}
                memory={memory}
                index={index}
                isOwner={isOwner}
                onEdit={openEditMemory}
                onDelete={setDeleting}
              />
            ))}
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t-2 border-border py-5 font-sans text-[10px] text-muted-foreground">
            <span>END OF TAPE · MORE MOMENTS TO COME</span>
            <span>MADE WITH A FULL HEART <span className="text-secondary">♥</span></span>
          </footer>
        </section>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="pixel-dialog border-2 border-foreground bg-card p-0 shadow-[var(--shadow-pixel)] sm:max-w-xl">
          <DialogHeader className="border-b-2 border-border p-5 pr-12 text-left sm:p-6">
            <p className="pixel-kicker text-accent">MEMORY EDITOR // SAVE SLOT</p>
            <DialogTitle className="pixel-section-title mt-3">
              {editing ? "Edit this moment" : "Add to the scrapbook"}
            </DialogTitle>
            <DialogDescription className="font-sans text-xs leading-5 text-muted-foreground">
              Photos, videos, and little thoughts all belong here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void handleSave(event)} className="space-y-5 p-5 sm:p-6">
            <fieldset>
              <legend className="pixel-field-label mb-2">MEMORY TYPE</legend>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Memory type">
                {kinds.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.kind}
                      type="button"
                      variant={kind === option.kind ? "default" : "outline"}
                      aria-pressed={kind === option.kind}
                      onClick={() => {
                        setKind(option.kind);
                        setFile(null);
                      }}
                      className="pixel-action h-12 px-2 text-[10px]"
                    >
                      <Icon aria-hidden="true" /> {option.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="memory-title" className="pixel-field-label">TITLE</Label>
              <Input
                id="memory-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={90}
                required
                autoComplete="off"
                className="pixel-input"
                placeholder="A moment worth keeping"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory-note" className="pixel-field-label">THOUGHT / CAPTION</Label>
              <Textarea
                id="memory-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={900}
                rows={4}
                className="pixel-input min-h-24 resize-y"
                placeholder="Write down the part you want to remember…"
              />
            </div>

            {kind !== "thought" && (
              <div className="space-y-2">
                <Label htmlFor="memory-file" className="pixel-field-label">
                  {kind === "photo" ? "PHOTO FILE" : "VIDEO FILE"}
                </Label>
                <Input
                  key={`${kind}-${editing?.id ?? "new"}`}
                  id="memory-file"
                  type="file"
                  accept={kind === "photo" ? "image/*" : "video/*"}
                  required={!editing?.mediaPath}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="pixel-input file:mr-3 file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-sans file:text-[11px] file:font-bold file:text-secondary-foreground"
                />
                <p className="font-sans text-[10px] leading-5 text-muted-foreground">
                  {editing?.mediaPath ? "Choose a new file only if you want to replace this one." : "Files up to 50 MB."}
                </p>
              </div>
            )}

            {notice && formOpen && (
              <p role={noticeError ? "alert" : "status"} className="pixel-notice pixel-notice-error">
                {notice}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t-2 border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="pixel-action">
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !isOwner} className="pixel-action">
                {saving ? <Upload className="animate-pulse" /> : <Sparkles />}
                {saving ? "Saving…" : editing ? "Save changes" : "Save memory"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="pixel-dialog border-2 border-foreground bg-card shadow-[var(--shadow-pixel)]">
          <AlertDialogHeader className="text-left">
            <p className="pixel-kicker text-secondary">REMOVE FROM SCRAPBOOK</p>
            <AlertDialogTitle className="pixel-section-title">Let this one go?</AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-sm leading-6 text-muted-foreground">
              “{deleting?.title}” and its uploaded media will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="pixel-action">Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="pixel-action bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              <Trash2 aria-hidden="true" /> Remove memory
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!authReady && <span className="sr-only" role="status">Checking owner access…</span>}
      {isOwner && ownerEmail && <span className="sr-only">Signed in as gallery owner</span>}
    </main>
  );
}

function MemoryTile({
  memory,
  index,
  isOwner,
  onEdit,
  onDelete,
}: {
  memory: MemoryCard;
  index: number;
  isOwner: boolean;
  onEdit: (memory: MemoryCard) => void;
  onDelete: (memory: MemoryCard) => void;
}) {
  const Icon = memory.kind === "photo" ? Camera : memory.kind === "video" ? Film : Quote;
  return (
    <article className={`memory-tile pixel-panel ${memory.kind === "thought" ? "memory-tile-thought" : ""}`}>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b-2 border-border px-3 py-2">
        <span className="pixel-type inline-flex items-center gap-2">
          <Icon aria-hidden="true" className="size-3.5" /> {memory.kind.toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          <span className="pixel-index">NO. {(index + 1).toString().padStart(2, "0")}</span>
          {isOwner && memory.editable && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pixel-icon-action"
                onClick={() => onEdit(memory)}
                aria-label={`Edit ${memory.title}`}
                title={`Edit ${memory.title}`}
              >
                <Pencil aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pixel-icon-action pixel-delete-action"
                onClick={() => onDelete(memory)}
                aria-label={`Remove ${memory.title}`}
                title={`Remove ${memory.title}`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </div>

      {memory.kind === "thought" ? (
        <div className="memory-thought-body">
          <Quote className="mb-5 size-7 text-secondary" aria-hidden="true" />
          <p className="pixel-thought-text">“{memory.note || "A little thought, saved for later."}”</p>
          {memory.mediaPath && !memory.mediaUrl && (
            <p role="status" className="mt-4 font-sans text-xs text-muted-foreground">Attached media is unavailable right now.</p>
          )}
        </div>
      ) : memory.kind === "video" && memory.mediaUrl ? (
        <CleanVideo
          src={memory.mediaUrl}
          label={memory.title}
          className="pixel-video-frame"
        />
      ) : memory.kind === "photo" && memory.mediaUrl ? (
        <div className="pixel-image-frame">
          <img src={memory.mediaUrl} alt={memory.title} loading="lazy" />
        </div>
      ) : (
        <div className="pixel-media-missing" role="img" aria-label={`${memory.kind} preview unavailable`}>
          <ImagePlus className="size-9" aria-hidden="true" />
          <span>PREVIEW NOT READY</span>
        </div>
      )}

      <div className="space-y-2 p-4">
        <h3 className="pixel-card-title">{memory.title}</h3>
        {memory.kind !== "thought" && memory.note && (
          <p className="font-sans text-xs leading-6 text-muted-foreground">{memory.note}</p>
        )}
        <p className="pixel-card-date">
          {memory.createdAt ? `SAVED ${formatSavedDate(memory.createdAt)}` : "FROM THE ORIGINAL SCRAPBOOK"}
        </p>
      </div>
    </article>
  );
}

function formatSavedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "JUST ADDED";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date).toUpperCase();
}
