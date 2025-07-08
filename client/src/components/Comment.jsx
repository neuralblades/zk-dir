import { useEffect, useState } from 'react';
import { FiThumbsUp, FiEdit3, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/user/${comment.userId}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getUser();
  }, [comment]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return commentDate.toLocaleDateString();
  };

  const isLiked = currentUser && comment.likes.includes(currentUser._id);
  const canEdit = currentUser && (currentUser._id === comment.userId || currentUser.isAdmin);

  return (
    <div className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-lg">
      <div className="flex gap-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <img
            className="w-10 h-10 rounded-full border border-zinc-700/50 object-cover"
            src={user.profilePicture}
            alt={user.username || 'User'}
          />
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-white text-sm">
              @{user.username || 'anonymous'}
            </span>
            <span className="text-zinc-500 text-xs">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                className="w-full p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 resize-none"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows="3"
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editedContent.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-300 text-black text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Comment Text */}
              <p className="text-zinc-200 text-sm leading-relaxed mb-3">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={() => onLike(comment._id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    isLiked
                      ? 'text-blue-400 bg-blue-950/20'
                      : 'text-zinc-400 hover:text-blue-400 hover:bg-blue-950/10'
                  }`}
                >
                  <FiThumbsUp className="w-4 h-4" />
                  {comment.numberOfLikes > 0 && (
                    <span className="font-medium">
                      {comment.numberOfLikes}
                    </span>
                  )}
                </button>

                {/* Edit and Delete Buttons */}
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg text-sm transition-colors duration-200"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(comment._id)}
                      className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg text-sm transition-colors duration-200"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}