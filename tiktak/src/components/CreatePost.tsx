"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../app/firebase";

export default function CreatePost() {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!caption) return setError("Caption is required");
    if (!user) {
      setError("Not signed in");
      return;
    }
    setLoading(true);
    try {
      const username = user.displayName ?? user.email ?? "user";
      const avatar = user.photoURL ?? null;
      const uid = user.uid;
      await createPost({ username, avatar, caption, uid });
      setCaption("");
    } catch (err) {
      setError("Failed to create post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{border:'1px solid #eaeaea',padding:12,borderRadius:6,marginBottom:16}}>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <img src={user.photoURL ?? "https://i.pravatar.cc/40"} alt="me" style={{width:44,height:44,borderRadius:22,objectFit:'cover'}} />
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's on your mind?" style={{flex:1,padding:8}} />
      </div>
      <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{color:'#e53e3e'}}>{error}</div>
        <button type="submit" disabled={loading} style={{background:'#0095f6',color:'#fff',border:0,padding:'8px 12px',borderRadius:6}}>{loading? 'Posting...' : 'Post'}</button>
      </div>
    </form>
  );
}
