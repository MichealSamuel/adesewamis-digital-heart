import { useState, type FormEvent } from "react";
import { KeyRound, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sfx, unlockSfx } from "@/lib/sfx";

type Player = "one" | "two";

const playerLines: Record<Player, [string, string]> = {
  one: [
    "This little world was made for two players. The gate remembers a birthday you know by heart.",
    "Think of the person who calls you his favorite player. His birthday is the key.",
  ],
  two: [
    "We saved the best moments just beyond this path. You're almost home.",
    "Let the month walk in first, then let the day follow. That's how the date opens the lane.",
  ],
};

export function GameDoorway({
  onUnlock,
}: {
  onUnlock: (password: string) => Promise<boolean>;
}) {
  const [playerOneTalks, setPlayerOneTalks] = useState(0);
  const [playerTwoTalks, setPlayerTwoTalks] = useState(0);
  const [dialogue, setDialogue] = useState({
    speaker: "THE LANE",
    text: "Two players, one saved world. Welcome back, Player Two.",
  });
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const cluesFound = Number(playerOneTalks > 0) + Number(playerTwoTalks > 0);

  function talkTo(player: Player) {
    unlockSfx();
    sfx.tap();
    const current = player === "one" ? playerOneTalks : playerTwoTalks;
    const lines = playerLines[player];
    const line = lines[Math.min(current, lines.length - 1)];
    setDialogue({ speaker: player === "one" ? "PLAYER ONE" : "PLAYER TWO", text: line });
    if (player === "one") setPlayerOneTalks((count) => Math.min(count + 1, lines.length - 1));
    else setPlayerTwoTalks((count) => Math.min(count + 1, lines.length - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cluesFound < 2 || !password.trim()) return;
    unlockSfx();
    sfx.tap();
    setBusy(true);
    setFeedback("");
    try {
      const unlocked = await onUnlock(password);
      if (unlocked) {
        setPassword("");
        sfx.sparkle();
        return;
      }
      setPassword("");
      setFeedback("Not quite, Player Two. The birthday clues are still waiting for you.");
    } catch {
      setFeedback("The gate couldn’t check that just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="memory-doorway min-h-screen px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div className="memory-doorway-shell mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-5">
        <header className="flex items-center justify-between gap-4 border-b-2 border-border pb-3">
          <div className="flex items-center gap-3">
            <span className="memory-doorway-mark" aria-hidden="true">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="pixel-micro">TWO-PLAYER SAVE FILE</p>
              <p className="text-[10px] text-muted-foreground">PRIVATE WORLD · EST. IN LOVE</p>
            </div>
          </div>
          <span className="pixel-kicker text-accent">GAME 01</span>
        </header>

        <section className="text-center">
          <p className="pixel-kicker mb-2 text-secondary">PLAYER ONE + PLAYER TWO</p>
          <h1 className="memory-doorway-title">MEMORY LANE</h1>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-muted-foreground sm:text-sm">
            A little world for two people, and all the moments worth keeping.
          </p>
        </section>

        <section className="memory-game-frame" aria-label="The two-player game entrance">
          <div className="memory-game-stage">
            <Sparkles className="memory-stage-star memory-stage-star-one" aria-hidden="true" />
            <Sparkles className="memory-stage-star memory-stage-star-two" aria-hidden="true" />
            <Sparkles className="memory-stage-star memory-stage-star-three" aria-hidden="true" />
            <div className="memory-pixel-moon" aria-hidden="true" />
            <div className="memory-stage-world" aria-hidden="true">
              <span className="memory-stage-hill memory-stage-hill-back" />
              <span className="memory-stage-hill memory-stage-hill-front" />
              <span className="memory-stage-path" />
            </div>
            <div className="memory-players">
              <div className="memory-player-slot">
                <PlayerSprite player="one" />
                <Button
                  type="button"
                  variant="outline"
                  className="pixel-action memory-talk-button"
                  aria-label="Talk to Player One"
                  onClick={() => talkTo("one")}
                >
                  <MessageCircle aria-hidden="true" /> PLAYER ONE
                </Button>
              </div>
              <div className="memory-player-slot">
                <PlayerSprite player="two" />
                <Button
                  type="button"
                  variant="outline"
                  className="pixel-action memory-talk-button"
                  aria-label="Talk to Player Two"
                  onClick={() => talkTo("two")}
                >
                  <MessageCircle aria-hidden="true" /> PLAYER TWO
                </Button>
              </div>
            </div>
            <div className="memory-stage-ground" aria-hidden="true" />
          </div>

          <div className="memory-dialogue" aria-live="polite" aria-atomic="true">
            <span className="memory-dialogue-speaker">{dialogue.speaker}</span>
            <p>{dialogue.text}</p>
          </div>
        </section>

        <section className="memory-gate-panel" aria-labelledby="memory-gate-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="pixel-kicker text-accent">QUEST LOG · {cluesFound}/2 CLUES</p>
              <h2 id="memory-gate-title" className="pixel-section-title mt-2">The little secret</h2>
            </div>
            <KeyRound className="size-6 text-primary" aria-hidden="true" />
          </div>

          <div className="memory-clue-list" aria-live="polite">
            <p className={playerOneTalks > 0 ? "memory-clue memory-clue-found" : "memory-clue"}>
              <span aria-hidden="true">{playerOneTalks > 0 ? "■" : "□"}</span>
              A birthday belonging to your favorite teammate.
            </p>
            <p className={playerTwoTalks > 0 ? "memory-clue memory-clue-found" : "memory-clue"}>
              <span aria-hidden="true">{playerTwoTalks > 0 ? "■" : "□"}</span>
              Month first. Day second.
            </p>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="memory-gate-form">
            <div className="min-w-0 flex-1">
              <Label htmlFor="memory-password" className="pixel-field-label">SECRET PHRASE</Label>
              <Input
                id="memory-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pixel-input mt-2"
                placeholder="Enter the date you know by heart"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={cluesFound < 2 || busy}
                aria-describedby={feedback ? "memory-gate-feedback" : undefined}
              />
            </div>
            <Button type="submit" className="pixel-action memory-unlock-button" disabled={cluesFound < 2 || busy || !password.trim()}>
              <KeyRound aria-hidden="true" /> {busy ? "CHECKING…" : "UNLOCK"}
            </Button>
          </form>
          <p id="memory-gate-feedback" className={feedback ? "memory-gate-feedback" : "memory-gate-feedback sr-only"} role="status">
            {feedback || "The gallery stays closed until the phrase is right."}
          </p>
        </section>

        <footer className="pb-2 text-center">
          <span className="pixel-micro text-muted-foreground">A PRIVATE LITTLE WORLD · TWO PLAYERS ONLY</span>
        </footer>
      </div>
    </main>
  );
}

function PlayerSprite({ player }: { player: Player }) {
  const isPlayerOne = player === "one";
  return (
    <svg
      viewBox="0 0 100 132"
      className={`memory-player-sprite ${isPlayerOne ? "memory-player-boy" : "memory-player-girl"}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <ellipse className="sprite-shadow" cx="50" cy="126" rx="28" ry="5" />
      <rect className="sprite-skin" x="34" y="24" width="32" height="31" />
      <rect className="sprite-hair" x={isPlayerOne ? 30 : 26} y="16" width={isPlayerOne ? 40 : 48} height="15" />
      <rect className="sprite-hair" x={isPlayerOne ? 28 : 23} y="24" width="10" height={isPlayerOne ? 15 : 50} />
      <rect className="sprite-hair" x={isPlayerOne ? 64 : 67} y="24" width="10" height={isPlayerOne ? 14 : 50} />
      <rect className="sprite-eye" x="42" y="37" width="4" height="5" />
      <rect className="sprite-eye" x="55" y="37" width="4" height="5" />
      <rect className="sprite-mouth" x="46" y="48" width="9" height="3" />
      <rect className={isPlayerOne ? "sprite-shirt-boy" : "sprite-shirt-girl"} x="29" y="58" width="42" height="30" />
      <rect className="sprite-skin" x="20" y="62" width="10" height="25" />
      <rect className="sprite-skin" x="70" y="62" width="10" height="25" />
      {isPlayerOne ? (
        <>
          <rect className="sprite-shorts" x="31" y="88" width="17" height="25" />
          <rect className="sprite-shorts" x="52" y="88" width="17" height="25" />
        </>
      ) : (
        <rect className="sprite-skirt" x="27" y="84" width="46" height="17" />
      )}
      <rect className="sprite-skin" x="35" y="110" width="12" height="12" />
      <rect className="sprite-skin" x="53" y="110" width="12" height="12" />
      <rect className="sprite-shoe" x="30" y="120" width="21" height="7" />
      <rect className="sprite-shoe" x="50" y="120" width="21" height="7" />
    </svg>
  );
}