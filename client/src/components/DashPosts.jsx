import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit3, FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
          if (data.posts.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchPosts();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(
        `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/post/deletepost/${postIdToDelete}/${currentUser._id}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setUserPosts((prev) =>
          prev.filter((post) => post._id !== postIdToDelete)
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleBulkDelete = async () => {
    setShowModal(false);
    try {
      const res = await fetch('/api/post/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postIds: selectedPosts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setUserPosts((prev) =>
          prev.filter((post) => !selectedPosts.includes(post._id))
        );
        setSelectedPosts([]);
        setSelectAll(false);
        setBulkDeleteMode(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(userPosts.map((post) => post._id));
    }
    setSelectAll(!selectAll);
  };

  const togglePostSelection = (postId) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter((id) => id !== postId));
      setSelectAll(false);
    } else {
      setSelectedPosts([...selectedPosts, postId]);
      if (selectedPosts.length + 1 === userPosts.length) {
        setSelectAll(true);
      }
    }
  };

  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    if (!bulkDeleteMode) {
      setSelectedPosts([]);
      setSelectAll(false);
    }
  };

  return (
    <div className="mt-4 max-w-6xl mx-auto w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Posts</h1>
          <p className="text-zinc-400">{userPosts.length} posts total</p>
        </div>

        {currentUser.isAdmin && userPosts.length > 0 ? (
          <>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={toggleBulkDeleteMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  bulkDeleteMode 
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                }`}
              >
                {bulkDeleteMode ? 'Cancel Selection' : 'Select Posts'}
              </button>
              
              {bulkDeleteMode && (
                <button
                  disabled={selectedPosts.length === 0}
                  onClick={() => {
                    setPostIdToDelete('bulk');
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-800/50 text-red-100 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete Selected ({selectedPosts.length})
                </button>
              )}
            </div>

            {/* Posts Table */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      {bulkDeleteMode && (
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 bg-zinc-700 border-zinc-600 rounded focus:ring-0 focus:ring-offset-0"
                          />
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Date Updated</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Protocol</th>
                      {!bulkDeleteMode && (
                        <>
                          <th className="px-4 py-3 text-center text-sm font-medium text-zinc-300">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {userPosts.map((post) => (
                      <tr key={post._id} className="hover:bg-zinc-800/30 transition-colors duration-200">
                        {bulkDeleteMode && (
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post._id)}
                              onChange={() => togglePostSelection(post._id)}
                              className="w-4 h-4 bg-zinc-700 border-zinc-600 rounded focus:ring-0 focus:ring-offset-0"
                            />
                          </td>
                        )}
                        <td className="px-4 py-4 text-sm text-zinc-300">
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/post/${post.slug}`}>
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-12 h-12 object-cover rounded-lg border border-zinc-700/50"
                            />
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/post/${post.slug}`}
                            className="text-white hover:text-zinc-300 font-medium transition-colors duration-200 line-clamp-2"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-400">
                          {post.protocol?.name || 'N/A'}
                        </td>
                        {!bulkDeleteMode && (
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <Link
                                to={`/update-post/${post._id}`}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors duration-200"
                              >
                                <FiEdit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  setShowModal(true);
                                  setPostIdToDelete(post._id);
                                }}
                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
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
                  Show More Posts
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center">
              <FiEdit3 className="w-12 h-12 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">No posts yet</h3>
            <p className="text-zinc-400 mb-6">Start creating posts to see them here.</p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-300 text-black rounded-lg font-medium transition-colors duration-200"
            >
              Create Your First Post
            </Link>
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
                <h3 className="text-lg font-semibold text-white mb-2">Confirm Deletion</h3>
                <p className="text-zinc-400 mb-6">
                  {postIdToDelete === 'bulk'
                    ? `Are you sure you want to delete ${selectedPosts.length} selected posts? This action cannot be undone.`
                    : 'Are you sure you want to delete this post? This action cannot be undone.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={postIdToDelete === 'bulk' ? handleBulkDelete : handleDeletePost}
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