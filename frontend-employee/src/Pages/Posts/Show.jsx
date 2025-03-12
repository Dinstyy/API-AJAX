import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import moment from "moment";
import { FaHeart, FaReply } from "react-icons/fa"; 

export default function Show() {
  const { id } = useParams();
  const { user, token } = useContext(AppContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [replyComment, setreplyComment] = useState({});
  const [likes, setLikes] = useState({});
  const [likedComments, setLikedComments] = useState({});

  async function getPost() {
    const res = await fetch(`/api/posts/${id}`);
    const data = await res.json();
    if (res.ok) setPost(data.post);
  }

  async function getComments() {
    const res = await fetch(`/api/posts/${id}/comments`);
    const data = await res.json();
    if (res.ok) {
      setComments(data);
  
      const initialLikes = {};
      const initialLikedComments = {};
  
      data.forEach(comment => {
        initialLikes[comment.id] = comment.likes;
        if (comment.liked_by_current_user) {
          initialLikedComments[comment.id] = true;
        }
      });
  
      setLikes(initialLikes);
      setLikedComments(initialLikedComments);
    }
  }  

  async function handleLike(commentId) {
    const newLikedStatus = !likedComments[commentId];
  
    setLikes((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + (newLikedStatus ? 1 : -1),
    }));
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: newLikedStatus,
    }));
  
    const savedLikes = JSON.parse(localStorage.getItem("likedComments")) || {};
    savedLikes[commentId] = newLikedStatus;
    localStorage.setItem("likedComments", JSON.stringify(savedLikes));
  
    const res = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (res.ok) {
      const data = await res.json();
      setLikes((prev) => ({ ...prev, [commentId]: data.likes }));
      setLikedComments((prev) => ({ ...prev, [commentId]: data.liked }));
  
      const updatedLikes = JSON.parse(localStorage.getItem("likedComments")) || {};
      updatedLikes[commentId] = data.liked;
      localStorage.setItem("likedComments", JSON.stringify(updatedLikes));
    }
  }  

  async function handleAddComment(e) {
    e.preventDefault();
    if (newComment.trim() === "") {
      setError("Oops! You forgot to write a comment.");
      return;
    }

    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      setError("");
      getComments();
    }
  }

  function toggleReply(commentId) {
    setreplyComment((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }

  async function handleDeleteComment(commentId) {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) getComments();
  }

  useEffect(() => {
    getPost();
    getComments();
  
    const savedLikes = JSON.parse(localStorage.getItem("likedComments")) || {};
    setLikedComments(savedLikes);
  }, []);
  
  return (
    <>
      {post ? (
        <div className="mt-4 mb-4 p-6 border rounded-md border-dashed border-slate-400">
          <h2 className="font-bold text-2xl mb-2">{post.title}</h2>
          <div className="flex items-center gap-2 mb-2">
            <img
              src={post.user.profile_photo || "/images/default.jpg"}
              alt="Profile"
              className="w-8 h-8 rounded-full border"
            />
            <small className="text-sm text-slate-600">
              Created by <span className="font-semibold">{post.user.name}</span>
            </small>
          </div>
          <hr className="border-t border-gray-300 my-3" />
          <p className="mb-8">{post.body}</p>

          {!user && (
              <p className="mt-2 text-red-500">
                Please <Link to="/login" className="text-blue-500 underline">log in</Link> to comment.
              </p>
            )}
            {user && (
              <form onSubmit={handleAddComment} className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                  placeholder="Write a comment..."
                  className="border border-slate-500 p-3 w-full rounded-lg mb-2 resize-none outline-none"
                  rows="3"
                ></textarea>

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <button
                  type="submit"
                  className="mt-2 font-semibold bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-1 rounded"
                >
                  Add Comment
                </button>
              </form>
            )}

            <div className="mt-6">
              <hr className="border-t border-gray-300 my-3 mb-4" />
              <h3 className="text-lg font-bold mb-3">
                {comments.length > 0 ? `${comments.length} Comments` : "Comments"}
              </h3>

              {comments.length === 0 ? (
                <p className=" text-gray-500 italic">Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-black p-3 rounded-lg mb-5 whitespace-pre-line">
                    <div className="flex items-center gap-3 mb-1">
                      <img
                        src={comment.user.profile_photo || "/images/default.jpg"}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border"
                      />
                      <div>
                        <p className="font-semibold">{comment.user.name}</p>
                        <small className="text-xs text-gray-500">
                          {moment(comment.created_at).fromNow()}
                        </small>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-2">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-gray-500 text-sm">
                      <button onClick={() => handleLike(comment.id)} className="flex items-center gap-0">
                        {likedComments[comment.id] ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaHeart className="text-gray-500" />
                        )}
                        <span className="font-medium ml-2">{likes[comment.id] || 0}</span>
                      </button>
                      <button
                        className={`flex items-center ${replyComment[comment.id] ? "text-blue-500" : "text-gray-500"}`}
                        onClick={() => toggleReply(comment.id)}
                      >
                        <FaReply className={replyComment[comment.id] ? "text-blue-500" : "text-gray-500"} />
                        <span className={`font-medium ml-2 ${replyComment[comment.id] ? "text-blue-500" : "text-slate-500"}`}>
                          Reply
                        </span>
                      </button>
                    </div>
                    {user && user.id === post.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 text-sm mt-3"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
        </div>
      ) : (
        <p>Post not found!</p>
      )}
    </>
  );
}
