import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../Context/AppContext";

export default function Home() {
  const { user } = useContext(AppContext);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  async function getPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();

    if (res.ok) {
      setPosts(data);
      setFilteredPosts(data);
    }
  }

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    if (search === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [search, posts]);

  return (
    <>
      <h1 className="title">
        {user ? (
          <>
            Welcome Back, <span className="text-purple-500">{user.name}</span>
          </>
        ) : (
          "Latest Posts"
        )}
      </h1>

      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded-md border-gray-400"
      />

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <Link
            to={`/posts/${post.id}`}
            key={post.id}
            className="block mb-4 p-4 border rounded-md border-slate-400 hover:bg-slate-100 transition"
          >
            <h2 className="font-bold text-2xl mb-1">{post.title}</h2> {/* Jarak ke tanggal */}
            <small className="text-xs text-slate-600 mb-2 block">
              {new Date(post.created_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>

            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                className="w-full h-60 object-cover rounded-md my-2"
              />
            )}

            <p className="truncate text-gray-700 overflow-hidden whitespace-nowrap text-ellipsis mt-2 mb-2">
              {post.body}
            </p>
          </Link>
        ))
      ) : (
        <p>No posts found</p>
      )}
    </>
  );
}
