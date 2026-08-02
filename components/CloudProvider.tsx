"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  firebaseReady,
  onUser,
  signInWithGoogle,
  signOutUser,
  mergeOnSignIn,
  type CloudUser,
} from "@/lib/cloud";

type SyncStatus = "idle" | "syncing" | "synced";

interface CloudContextValue {
  ready: boolean; // Firebase configured for this deployment
  user: CloudUser | null;
  status: SyncStatus;
  /** Bumps when the local archive changed because of a cloud pull. */
  version: number;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const CloudContext = createContext<CloudContextValue>({
  ready: false,
  user: null,
  status: "idle",
  version: 0,
  signIn: async () => {},
  signOut: async () => {},
});

export function useCloud(): CloudContextValue {
  return useContext(CloudContext);
}

// Mounted once app-wide. Watches auth, and on sign-in performs a two-way merge
// between the local archive and the cloud. When Firebase is not configured this
// is inert, so the app runs exactly as before (local-only).
export function CloudProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CloudUser | null>(null);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!firebaseReady) return;
    const unsub = onUser(async (u) => {
      setUser(u);
      if (!u) {
        setStatus("idle");
        return;
      }
      setStatus("syncing");
      try {
        const changed = await mergeOnSignIn(u.uid);
        if (changed > 0) setVersion((v) => v + 1);
      } catch {
        /* offline or rules: stay local */
      }
      setStatus("synced");
    });
    return unsub;
  }, []);

  const value = useMemo<CloudContextValue>(
    () => ({
      ready: firebaseReady,
      user,
      status,
      version,
      signIn: signInWithGoogle,
      signOut: signOutUser,
    }),
    [user, status, version],
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}
