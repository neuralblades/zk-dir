import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiX, FiCheck, FiMessageCircle } from 'react-icons/fi';
import Comment from './Comment';

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) {
      return;
    }
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = async (comment, editedContent) => {
    setComments(
      comments.map((c) =>
        c._id === comment._id ? { ...c, content: editedContent } : c
      )
    );
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="w-full">
      {/* Sign-in Status */}
      {currentUser ? (
        <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
          <img
            className="w-8 h-8 object-cover rounded-full border border-zinc-700/50"
            src={currentUser.profilePicture}
            alt="Profile"
          />
          <div>
            <p className="text-sm text-zinc-400">Signed in as:</p>
            <Link
              to="/dashboard?tab=profile"
              className="text-white hover:text-zinc-300 font-medium transition-colors duration-200"
            >
              @{currentUser.username}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-950/20 border border-blue-800/30 rounded-lg">
          <p className="text-blue-200 text-sm">
            You must be signed in to comment.{' '}
            <Link 
              className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200" 
              to="/sign-in"
            >
              Sign In
            </Link>
          </p>
        </div>
      )}

      {/* Comment Form */}
      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg"
        >
          <textarea
            className="w-full bg-zinc-800/50 text-white border border-zinc-700/50 rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 resize-none"
            placeholder="Add a comment..."
            rows="3"
            maxLength="200"
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-zinc-500 text-xs">
              {200 - comment.length} characters remaining
            </p>
            <button
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-300 text-black rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!comment.trim() || comment.length > 200}
            >
              Submit
            </button>
          </div>
          {commentError && (
            <div className="mt-4 p-3 bg-red-950/30 border border-red-800/30 rounded-lg text-red-100 text-sm">
              {commentError}
            </div>
          )}
        </form>
      )}

      {/* Comments Section */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
              <FiMessageCircle className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No comments yet</h3>
            <p className="text-zinc-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <>
            {/* Comments Header */}
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-lg font-semibold text-white">Comments</h3>
              <span className="px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-300 text-sm">
                {comments.length}
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onLike={handleLike}
                  onEdit={handleEdit}
                  onDelete={(commentId) => {
                    setShowModal(true);
                    setCommentToDelete(commentId);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Comment</h3>
              <p className="text-zinc-400 mb-6">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleDelete(commentToDelete)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-800/50 text-red-100 rounded-lg font-medium transition-colors duration-200"
                >
                  <FiCheck className="w-4 h-4" />
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}