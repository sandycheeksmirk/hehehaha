// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);

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

// Storage removed; posts are text-only now