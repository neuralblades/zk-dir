import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiTrash2, FiAlertTriangle, FiX, FiCheck, FiMessageCircle, FiHeart } from 'react-icons/fi';

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comment/getcomments`);
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          if (data.comments.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchComments();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      const res = await fetch(
        `/api/comment/getcomments?startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, ...data.comments]);
        if (data.comments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/comment/deleteComment/${commentIdToDelete}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToDelete)
        );
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="mt-4 max-w-6xl mx-auto w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comment Management</h1>
          <p className="text-zinc-400">{comments.length} comments total</p>
        </div>

        {currentUser.isAdmin && comments.length > 0 ? (
          <>
            {/* Comments Table */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Date Updated</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Comment</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Username</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Post Title</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-zinc-300">Likes</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-zinc-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {comments.map((comment) => (
                      <tr key={comment._id} className="hover:bg-zinc-800/30 transition-colors duration-200">
                        <td className="px-4 py-4 text-sm text-zinc-300">
                          {new Date(comment.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <div className="text-sm text-white line-clamp-3">
                            {comment.content}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {comment.userId?.profilePicture && (
                              <img
                                src={comment.userId.profilePicture}
                                alt="User"
                                className="w-8 h-8 rounded-full border border-zinc-700/50"
                              />
                            )}
                            <div>
                              <div className="font-medium text-white">
                                {comment.userId?.username || 'Unknown User'}
                              </div>
                              <div className="text-xs text-zinc-400">
                                {comment.userId?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-sm">
                          {comment.postId?.slug ? (
                            <Link
                              to={`/post/${comment.postId.slug}`}
                              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 line-clamp-2"
                            >
                              {comment.postId.title || 'Untitled Post'}
                            </Link>
                          ) : (
                            <span className="text-zinc-500 text-sm">Post not found</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FiHeart className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-zinc-300">
                              {comment.numberOfLikes || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => {
                                setShowModal(true);
                                setCommentIdToDelete(comment._id);
                              }}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Show More Button */}
            {showMore && (
              <div className="text-center mt-6">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-white rounded-lg transition-colors duration-200"
                >
                  Show More Comments
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center">
              <FiMessageCircle className="w-12 h-12 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">No comments yet</h3>
            <p className="text-zinc-400">Comments will appear here when users start engaging with posts.</p>
          </div>
        )}

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
                    onClick={handleDeleteComment}
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
    </div>
  );
}