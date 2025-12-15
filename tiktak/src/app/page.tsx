"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import CreatePost from "../components/CreatePost";
import { useAuth } from "../context/AuthContext";
import { subscribeFeed, subscribeStories } from "./firebase";

const Story: React.FC<{ name: string; img?: string }> = ({ name, img }) => (
	<div className={styles.story}>
		<img src={img ?? "https://i.pravatar.cc/100"} alt={name} />
		<div className={styles.storyName}>{name}</div>
	</div>
);

const Post: React.FC<{ user: string; avatar?: string; caption?: string }> = ({ user, avatar, caption }) => (
	<div className={styles.post}>
		<div className={styles.postHeader}>
			<div className={styles.userInfo}>
				<img className={styles.avatar} src={avatar ?? "https://i.pravatar.cc/150"} alt={user} />
				<div className={styles.username}>{user}</div>
			</div>
			<div className={styles.more}>•••</div>
		</div>
		<div className={styles.postBody}>
			<div className={styles.caption}><strong>{user}</strong> {caption}</div>
		</div>
		<div className={styles.postActions}>
			<div className={styles.actionsLeft}>
				<button aria-label="like">♡</button>
				<button aria-label="comment">💬</button>
				<button aria-label="share">✈️</button>
			</div>
			<div className={styles.actionsRight}>🔖</div>
		</div>
	</div>
);

export default function Home() {
	const { user } = useAuth();
	const [stories, setStories] = useState<any[]>([]);
	const [posts, setPosts] = useState<any[]>([]);

	useEffect(() => {
		if (!user) {
			setStories([]);
			setPosts([]);
			return;
		}

		// subscribe to real collections when user is signed in
		const unsubPosts = subscribeFeed((p) => setPosts(p));
		const unsubStories = subscribeStories((s) => setStories(s));

		return () => {
			unsubPosts();
			unsubStories();
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
								{posts.length > 0 ? posts.map((p) => <Post key={p.id} user={p.username ?? p.author ?? user.displayName ?? 'user'} avatar={p.avatar} caption={p.caption} />) : <div style={{color:'#8e8e8e'}}>No posts yet</div>}
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
						<div className={styles.suggestionsTitle}>Suggestions for you</div>
						{user ? (
							<div style={{color:'#8e8e8e'}}>No suggestions yet</div>
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

