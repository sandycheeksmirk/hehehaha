"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import CreatePost from "../components/CreatePost";
import { useAuth } from "../context/AuthContext";
import { subscribeFeed, subscribeStories } from "./firebase";
import { sendFriendRequest, subscribeIncomingRequests, acceptFriendRequest, rejectFriendRequest, subscribeOutgoingRequests, subscribeFriends, toggleLike, sharePost, repostPost, addComment, subscribeComments } from "./firebase";

const Story: React.FC<{ name: string; img?: string }> = ({ name, img }) => (
	<div className={styles.story}>
		<img src={img ?? "https://i.pravatar.cc/100"} alt={name} />
		<div className={styles.storyName}>{name}</div>
	</div>
);

const Post: React.FC<{ post: any }> = ({ post }) => {
	const { user } = useAuth();
	const likedBy: string[] = post.likedBy ?? [];
	const sharedBy: string[] = post.sharedBy ?? [];
	const meLiked = user ? likedBy.includes(user.uid) : false;

	async function onLike() {
		if (!user) return;
		await toggleLike(post.id, user.uid);
	}

	async function onShare() {
		if (!user) return;
		await sharePost(post.id, user.uid);
		alert('Post shared');
	}

	async function onRepost() {
		if (!user) return;
		await repostPost(post.id, user.uid, user.displayName ?? user.email ?? null);
		alert('Reposted');
	}

	const [comments, setComments] = useState<any[]>([]);
	const [commentText, setCommentText] = useState("");

	useEffect(() => {
		if (!post.id) return;
		const unsub = subscribeComments(post.id, (c) => setComments(c));
		return () => unsub();
	}, [post.id]);

	async function postComment() {
		if (!user) return alert("Sign in to comment");
		if (!commentText.trim()) return;
		try {
			await addComment(post.id, user.uid, user.displayName ?? user.email ?? null, commentText.trim());
			setCommentText("");
		} catch (err) {
			console.error(err);
			alert("Failed to post comment");
		}
	}

	return (
		<div className={styles.post}>
			<div className={styles.postHeader}>
				<div className={styles.userInfo}>
					<img className={styles.avatar} src={post.avatar ?? "https://i.pravatar.cc/150"} alt={post.username} />
					<div className={styles.username}>{post.username}</div>
				</div>
				<div className={styles.more}>•••</div>
			</div>
			<div className={styles.postBody}>
				<div className={styles.caption}><strong>{post.username}</strong> {post.caption}</div>
			</div>
			<div className={styles.postActions}>
				<div className={styles.actionsLeft}>
					<button aria-label="like" onClick={onLike}>{meLiked ? '♥' : '♡'}</button>
					<button aria-label="comment">💬</button>
					<button aria-label="share" onClick={onShare}>✈️</button>
				</div>
				<div className={styles.actionsRight}>
					<button onClick={onRepost}>🔁</button>
				</div>
			</div>
			<div className={styles.likes}>{(likedBy.length ?? 0)} likes · {(sharedBy.length ?? 0)} shares</div>
			<div className={styles.comments}>
				{comments.map((c) => (
					<div key={c.id} style={{padding:'6px 0',borderTop:'1px solid #f1f1f1'}}>
						<strong style={{marginRight:8}}>{c.username ?? 'User'}</strong>
						<span>{c.text}</span>
					</div>
				))}

				<div style={{display:'flex',gap:8,marginTop:8}}>
					<input value={commentText} onChange={(e)=>setCommentText(e.target.value)} placeholder="Add a comment..." style={{flex:1,padding:6}} />
					<button onClick={postComment} style={{background:'#0095f6',color:'#fff',border:0,padding:'6px 10px',borderRadius:6}}>Comment</button>
				</div>
			</div>
		</div>
	);
};

export default function Home() {
	const { user } = useAuth();
	const [stories, setStories] = useState<any[]>([]);
	const [posts, setPosts] = useState<any[]>([]);
	const [incoming, setIncoming] = useState<any[]>([]);
	const [outgoing, setOutgoing] = useState<any[]>([]);
	const [friends, setFriends] = useState<string[]>([]);

	useEffect(() => {
		if (!user) {
			setStories([]);
			setPosts([]);
			return;
		}

		// subscribe to real collections when user is signed in
		const unsubPosts = subscribeFeed((p) => setPosts(p));
		const unsubStories = subscribeStories((s) => setStories(s));
		const unsubIncoming = subscribeIncomingRequests(user.uid, (r) => setIncoming(r));
		const unsubOutgoing = subscribeOutgoingRequests(user.uid, (r) => setOutgoing(r));
		const unsubFriends = subscribeFriends(user.uid, (r) => setFriends(r));

		return () => {
			unsubPosts();
			unsubStories();
			unsubIncoming();
			unsubOutgoing();
			unsubFriends();
		};
	}, [user]);

	return (
		<div className={styles.app}>
			<nav className={styles.nav}>
				<div className={styles.logo}>outstargram</div>
				<div className={styles.search}>Search</div>
				<div className={styles.navIcons}>🏠 ✨ ➕ ❤️</div>
			</nav>

			<main className={styles.main}>
				<section className={styles.left}>
					<div className={styles.storiesBar}>
						{user ? (
							stories.length > 0 ? stories.map((s) => <Story key={s.id} name={s.username ?? s.name} img={s.photoURL ?? s.img} />) : <div style={{color:'#8e8e8e'}}>No stories yet</div>
						) : (
							<div style={{color:'#8e8e8e'}}>Login to view stories</div>
						)}
					</div>

					<div className={styles.feed}>
						{user ? (
							<>
								<CreatePost />
								{posts.length > 0 ? posts.map((p) => <Post key={p.id} post={p} />) : <div style={{color:'#8e8e8e'}}>No posts yet</div>}
							</>
						) : (
							<div style={{color:'#8e8e8e'}}>Login to see posts</div>
						)}
					</div>
				</section>

				<aside className={styles.right}>
					<div className={styles.profileCard}>
						<img className={styles.profileAvatar} src={user?.photoURL ?? "https://i.pravatar.cc/150?img=5"} alt={user?.displayName ?? "you"} />
						<div className={styles.profileInfo}>
							<div className={styles.profileName}>{user?.displayName ?? "you"}</div>
							<div className={styles.profileHandle}>{user?.email ?? ""}</div>
						</div>
					</div>

					<div className={styles.suggestions}>
						<div className={styles.suggestionsTitle}>Incoming requests</div>
						{user ? (
							incoming.length > 0 ? incoming.map((r) => (
								<div key={r.id} className={styles.suggestionItem}>
									<div style={{flex:1}}><strong>{r.fromName ?? r.fromUid}</strong><div style={{fontSize:12,color:'#8e8e8e'}}>requested access</div></div>
									<div style={{display:'flex',gap:6}}>
										<button onClick={() => acceptFriendRequest(r.id)} style={{background:'#22c55e',color:'#fff',border:0,padding:'6px 8px',borderRadius:6}}>Accept</button>
										<button onClick={() => rejectFriendRequest(r.id)} style={{background:'#ef4444',color:'#fff',border:0,padding:'6px 8px',borderRadius:6}}>Reject</button>
									</div>
								</div>
							)) : <div style={{color:'#8e8e8e'}}>No requests</div>
						) : (
							<div style={{color:'#8e8e8e'}}>Login to see requests</div>
						)}

						<div style={{marginTop:12}} className={styles.suggestionsTitle}>People you may know</div>
						{user ? (
							// static examples; in a real app list would come from users collection
							[
								{ uid: 'uid12', name: 'friend1', img: 'https://i.pravatar.cc/150?img=12' },
								{ uid: 'uid13', name: 'friend2', img: 'https://i.pravatar.cc/150?img=13' },
							].map((s) => {
								const out = outgoing.find((o) => o.toUid === s.uid);
								const isFriend = friends.includes(s.uid);
								return (
									<div key={s.uid} className={styles.suggestionItem}>
										<img src={s.img} />
										<div className={styles.suggInfo}><strong>{s.name}</strong><div style={{fontSize:12,color:'#8e8e8e'}}>{isFriend ? 'Friend' : out ? (out.status === 'pending' ? 'Requested' : out.status) : 'Not friends'}</div></div>
										<button disabled={!!out || isFriend} onClick={() => sendFriendRequest(user.uid, user.displayName ?? user.email ?? null, s.uid, s.name)}>{isFriend ? 'Friend' : out ? 'Requested' : 'Add Friend'}</button>
									</div>
								);
							})
						) : (
							<div style={{color:'#8e8e8e'}}>Login to see suggestions</div>
						)}
					</div>
				</aside>
			</main>

			<footer className={styles.footer}>© tiktak</footer>
		</div>
	);
}

