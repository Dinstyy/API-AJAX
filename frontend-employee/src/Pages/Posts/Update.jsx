import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { useNavigate, useParams } from "react-router-dom";

export default function Update() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
  });
  const [errors, setErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const abortController = new AbortController();

    async function getPost() {
      try {
        const res = await fetch(`/api/posts/${id}`, { signal: abortController.signal });
        if (!res.ok) throw new Error("Failed to fetch post");

        const data = await res.json();

        if (data.post.user_id !== user.id) {
          navigate("/");
          return;
        }

        setFormData({
          title: data.post.title,
          body: data.post.body,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching post:", error);
        }
      }
    }

    getPost();
    return () => abortController.abort();
  }, [id, user, navigate]);

  async function handleUpdate() {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.errors) {
      setErrors(data.errors);
    } else {
      navigate("/profile");
    }
  }

  useEffect(() => {
    const handleShowPopup = () => {
      if (isEdited) {
        setIsPopupOpen(true);
      } else {
        navigate(-1); 
      }
    };

    window.addEventListener("showPopup", handleShowPopup);
    return () => window.removeEventListener("showPopup", handleShowPopup);
  }, [isEdited, navigate]);

  return (
    <>
      <h1 className="title">Update your post</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className="w-1/2 mx-auto space-y-6"
      >
        <div>
          <input
            type="text"
            placeholder="Post Title"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              setIsEdited(true);
            }}
          />
          {errors.title && <p className="error">{errors.title[0]}</p>}
        </div>

        <div>
          <textarea
            rows="6"
            placeholder="Post Content"
            value={formData.body}
            onChange={(e) => {
              setFormData({ ...formData, body: e.target.value });
              setIsEdited(true);
            }}
          ></textarea>
          {errors.body && <p className="error">{errors.body[0]}</p>}
        </div>

        <button
          type="submit"
          className={`primary-btn ${
            isEdited ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isEdited}
        >
          Update
        </button>
      </form>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-base font-semibold mb-4">Simpan perubahan?</p>
            <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setIsPopupOpen(false);
              navigate("/profile"); 
            }}
            className="px-4 py-2 bg-gray-400 text-white rounded-md text-sm font-medium"
          >
            Cancel
          </button>
              <button
                onClick={() => {
                  handleUpdate();
                  setIsPopupOpen(false);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-md text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}