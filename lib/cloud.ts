import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { firebaseReady, fbAuth, fbDb } from "./firebase";
import { listWeeks, saveWeek, type SavedWeek } from "./archive";

// The cloud mirror of the local archive. Each user's weeks live at
// users/{uid}/weeks/{weekId}. Everything here no-ops when Firebase is not
// configured or nobody is signed in, so callers never need to branch.

export interface CloudUser {
  uid: string;
  email: string | null;
  name: string | null;
}

let _uid: string | null = null;

export { firebaseReady };

function toUser(u: User | null): CloudUser | null {
  return u ? { uid: u.uid, email: u.email, name: u.displayName } : null;
}

/** Subscribe to auth state. Returns an unsubscribe fn (no-op if unconfigured). */
export function onUser(cb: (user: CloudUser | null) => void): () => void {
  const auth = fbAuth();
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (u) => {
    _uid = u?.uid ?? null;
    cb(toUser(u));
  });
}

export async function signInWithGoogle(): Promise<void> {
  const auth = fbAuth();
  if (!auth) return;
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutUser(): Promise<void> {
  const auth = fbAuth();
  if (auth) await signOut(auth);
}

/** Push one saved week to the cloud. No-op if signed out or unconfigured. */
export async function syncWeekUp(week: SavedWeek): Promise<void> {
  const db = fbDb();
  if (!db || !_uid) return;
  try {
    await setDoc(doc(db, "users", _uid, "weeks", week.id), week);
  } catch {
    /* offline or rules: best-effort */
  }
}

export async function syncWeekRemove(id: string): Promise<void> {
  const db = fbDb();
  if (!db || !_uid) return;
  try {
    await deleteDoc(doc(db, "users", _uid, "weeks", id));
  } catch {
    /* best-effort */
  }
}

async function pullWeeks(uid: string): Promise<SavedWeek[]> {
  const db = fbDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, "users", uid, "weeks"));
  return snap.docs
    .map((d) => d.data() as SavedWeek)
    .filter((w) => w && w.id && w.narrative && Array.isArray(w.narrative.beats));
}

// Two-way merge on sign-in: newest savedAt wins per week id, and local-only
// weeks are pushed up so the two stores converge. Returns how many changed
// locally, so the UI can refresh.
export async function mergeOnSignIn(uid: string): Promise<number> {
  if (!firebaseReady) return 0;
  _uid = uid;
  const cloud = await pullWeeks(uid);
  const local = listWeeks();
  const localById = new Map(local.map((w) => [w.id, w]));
  const cloudById = new Map(cloud.map((w) => [w.id, w]));

  let localChanges = 0;

  // Cloud -> local (adopt newer or missing).
  for (const c of cloud) {
    const l = localById.get(c.id);
    if (!l || c.savedAt > l.savedAt) {
      saveWeek(c.narrative, c.savedAt);
      localChanges++;
    }
  }

  // Local -> cloud (push newer or missing).
  for (const l of local) {
    const c = cloudById.get(l.id);
    if (!c || l.savedAt > c.savedAt) {
      await syncWeekUp(l);
    }
  }

  return localChanges;
}
