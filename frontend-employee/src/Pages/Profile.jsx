import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, token, setUser, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profile_photo: user?.profile_photo || "",
    bio: user?.bio || "",
  });

  useEffect(() => {
    console.log("Current user:", user);
    async function fetchUserPosts() {
      if (!user?.id) return; 
      
      const res = await fetch(`/api/posts?user_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        console.log("User posts:", data); 
      }
    }
  
    if (user) fetchUserPosts();
  }, [user, token]);  

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profile_photo: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdateProfile() {
    console.log("Sending data:", formData);
  
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    });
  
    const result = await res.json();
    console.log("Response:", result);
  
    if (res.ok) {
      setUser({ ...user, ...formData });
      setEditing(false);
    }
  }  

  async function handleDeletePicture() {
    const res = await fetch("/api/delete-profile-picture", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (res.ok) {
      setFormData((prev) => ({ ...prev, profile_photo: "" }));
      setUser((prev) => ({ ...prev, profile_photo: "" })); 
    }
  }  

  async function handleDeletePost(postId) {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPosts(posts.filter((post) => post.id !== postId));
    }
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex flex-col items-center">
          <img
            src={formData.profile_photo || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full border mb-4"
          />
          {editing && <input type="file" onChange={handleImageChange} className="border p-2 w-full" />}
          {editing && formData.profile_photo && (
            <button onClick={handleDeletePicture} className="bg-red-500 text-white px-3 py-1 rounded mt-2">Delete Picture</button>
          )}
        </div>
        {editing ? (
          <div className="space-y-4 mt-4">
            <label className="block text-gray-700">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="border p-2 w-full" />
            
            <label className="block text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="border p-2 w-full" />
            
            <label className="block text-gray-700">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className="border p-2 w-full"></textarea>
            
            <button onClick={handleUpdateProfile} className="bg-blue-500 text-white px-4 py-2 rounded">Save Changes</button>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500">{user.bio}</p>
            <button onClick={() => setEditing(true)} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">Edit Profile</button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mt-6">
        <h2 className="text-lg font-semibold mb-4">Your Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No posts available.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Title</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border">
                  <td className="border p-2 text-center">{post.title}</td>
                  <td className="border p-2 text-center space-x-2">
                    <button onClick={() => navigate(`/Posts/Update/${post.id}`)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDeletePost(post.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <button 
      onClick={() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        navigate("/"); 
        }} 
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}