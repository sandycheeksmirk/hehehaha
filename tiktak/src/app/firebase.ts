// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { updateDoc, doc, arrayUnion, arrayRemove, runTransaction } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZIZLVdRXArdQUg4m-K2sCnfYoPZDv6_4",
  authDomain: "hehehaha-7372c.firebaseapp.com",
  projectId: "hehehaha-7372c",
  storageBucket: "hehehaha-7372c.firebasestorage.app",
  messagingSenderId: "382939607686",
  appId: "1:382939607686:web:1a04d08f41e4ee21319707",
  measurementId: "G-HLWGY5912T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/**
 * Analytics is browser-only and may access `window`/cookies.
 * Call `initAnalytics()` from client-side code if you want analytics.
 */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  const mod = await import("firebase/analytics");
  if (await mod.isSupported()) {
    return mod.getAnalytics(app);
  }
  return null;
}

// Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  return fbSignOut(auth);
}

export function onAuthChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

export { auth };

// Firestore
const db = getFirestore(app);

export async function fetchFeedPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeFeed(callback: (posts: any[]) => void) {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function fetchStories() {
  const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeStories(callback: (stories: any[]) => void) {
  const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function createPost(post: { username: string; avatar?: string | null; imageURL?: string | null; caption?: string | null; uid?: string | null }) {
  const docRef = await addDoc(collection(db, "posts"), {
    username: post.username,
    avatar: post.avatar ?? null,
    imageURL: post.imageURL ?? null,
    caption: post.caption ?? null,
    uid: post.uid ?? null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Friend requests
export async function sendFriendRequest(fromUid: string, fromName: string | null, toUid: string, toName: string | null) {
  return addDoc(collection(db, "friendRequests"), {
    fromUid,
    fromName: fromName ?? null,
    toUid,
    toName: toName ?? null,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export function subscribeIncomingRequests(uid: string, callback: (requests: any[]) => void) {
  const q = query(collection(db, "friendRequests"), where("toUid", "==", uid), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function subscribeOutgoingRequests(uid: string, callback: (requests: any[]) => void) {
  const q = query(collection(db, "friendRequests"), where("fromUid", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function acceptFriendRequest(requestId: string) {
  const ref = doc(db, "friendRequests", requestId);
  await updateDoc(ref, { status: "accepted", respondedAt: serverTimestamp() });
}

export async function rejectFriendRequest(requestId: string) {
  const ref = doc(db, "friendRequests", requestId);
  await updateDoc(ref, { status: "rejected", respondedAt: serverTimestamp() });
}

export function subscribeFriends(uid: string, callback: (friendUids: string[]) => void) {
  // two subscriptions: requests where current user is fromUid and accepted, and where current user is toUid and accepted
  const q1 = query(collection(db, "friendRequests"), where("fromUid", "==", uid), where("status", "==", "accepted"));
  const q2 = query(collection(db, "friendRequests"), where("toUid", "==", uid), where("status", "==", "accepted"));
  const unsub1 = onSnapshot(q1, (snap) => {
    const other = snap.docs.map((d) => d.data().toUid).filter(Boolean) as string[];
    // merge by also reading q2 snapshot
    // We'll fetch q2 manually to combine
    getDocs(q2).then((snap2) => {
      const other2 = snap2.docs.map((d) => d.data().fromUid).filter(Boolean) as string[];
      callback(Array.from(new Set([...other, ...other2])));
    });
  });
  const unsub2 = onSnapshot(q2, (snap) => {
    const other = snap.docs.map((d) => d.data().fromUid).filter(Boolean) as string[];
    getDocs(q1).then((snap1) => {
      const other2 = snap1.docs.map((d) => d.data().toUid).filter(Boolean) as string[];
      callback(Array.from(new Set([...other, ...other2])));
    });
  });
  return () => {
    unsub1();
    unsub2();
  };
}

export async function isFriend(aUid: string, bUid: string) {
  const q1 = query(collection(db, "friendRequests"), where("fromUid", "==", aUid), where("toUid", "==", bUid), where("status", "==", "accepted"));
  const q2 = query(collection(db, "friendRequests"), where("fromUid", "==", bUid), where("toUid", "==", aUid), where("status", "==", "accepted"));
  const [r1, r2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  return r1.size > 0 || r2.size > 0;
}

// Likes, reposts, shares
export async function toggleLike(postId: string, uid: string) {
  const ref = doc(db, "posts", postId);
  await runTransaction(db, async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists()) throw new Error("Post not found");
    const data: any = snap.data();
    const likedBy: string[] = data.likedBy ?? [];
    if (likedBy.includes(uid)) {
      t.update(ref, { likedBy: arrayRemove(uid) });
    } else {
      t.update(ref, { likedBy: arrayUnion(uid) });
    }
  });
}

export async function sharePost(postId: string, uid: string) {
  const ref = doc(db, "posts", postId);
  // just record the share
  await updateDoc(ref, { sharedBy: arrayUnion(uid) });
}

export async function repostPost(postId: string, uid: string, username: string | null) {
  const ref = doc(db, "posts", postId);
  const snap = await getDocs(query(collection(db, "posts"), where("__name__", "==", postId)));
  const original = snap.docs[0];
  if (!original) throw new Error("Original post not found");
  const data: any = original.data();
  // create a new post referencing the original
  const docRef = await addDoc(collection(db, "posts"), {
    username: username ?? "user",
    avatar: null,
    caption: `Repost: ${data.caption ?? ""}`,
    originalPostId: postId,
    uid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Comments (as subcollection under posts)
export async function addComment(postId: string, uid: string, username: string | null, text: string) {
  return addDoc(collection(db, "posts", postId, "comments"), {
    uid,
    username: username ?? null,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeComments(postId: string, callback: (comments: any[]) => void) {
  const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// Storage removed; posts are text-only now