"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}>
      <div style={{padding:24,border:'1px solid #eaeaea',borderRadius:8,textAlign:'center'}}>
        <h2>Sign in</h2>
        <p>Use Google to sign in</p>
        <button onClick={() => signInWithGoogle()} style={{background:'#0095f6',color:'#fff',padding:'8px 12px',border:0,borderRadius:6,cursor:'pointer'}}>Sign in with Google</button>
        {loading && <div style={{marginTop:8}}>Loading…</div>}
      </div>
    </div>
  );
}
