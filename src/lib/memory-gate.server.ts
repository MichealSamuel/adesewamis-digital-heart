import { useSession } from "@tanstack/react-start/server";

export type MemoryGateSession = {
  unlocked?: boolean;
};

function getSessionConfig() {
  const sessionSecret = process.env["SESSION_SECRET"];
  if (!sessionSecret) throw new Error("Memory Lane session security is not configured.");

  return {
    password: sessionSecret,
    name: "memory-lane-session",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export function getMemoryGateSession() {
  return useSession<MemoryGateSession>(getSessionConfig());
}

export async function requireMemoryGateSession() {
  const session = await getMemoryGateSession();
  if (!session.data.unlocked) throw new Error("The Memory Lane gallery is locked.");
  return session;
}