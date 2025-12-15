"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./navbar.module.css";
import Link from "next/link";

export default function Navbar() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  return (
    <header className={styles.nav}>
      <div className={styles.left}>
        <Link href="/">tiktak</Link>
      </div>
      <div className={styles.right}>
        {!loading && !user && (
          <>
            <Link href="/login" className={styles.btn}>Login</Link>
            <button className={styles.btn} onClick={() => signInWithGoogle()}>Sign in with Google</button>
          </>
        )}

        {user && (
          <div className={styles.profile}>
            <img src={user.photoURL ?? "https://i.pravatar.cc/40"} alt={user.displayName ?? "user"} />
            <div className={styles.name}>{user.displayName ?? user.email}</div>
            <button className={styles.logout} onClick={() => signOut()}>Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}
