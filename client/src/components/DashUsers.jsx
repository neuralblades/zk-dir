import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiTrash2, FiAlertTriangle, FiX, FiCheck, FiUsers, FiShield, FiMinus } from 'react-icons/fi';

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`);
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setShowModal(false);
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
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-zinc-400">{users.length} users total</p>
        </div>

        {currentUser.isAdmin && users.length > 0 ? (
          <>
            {/* Users Table */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Date Created</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Profile</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Username</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Email</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-zinc-300">Admin</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-zinc-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-zinc-800/30 transition-colors duration-200">
                        <td className="px-4 py-4 text-sm text-zinc-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              className="w-10 h-10 object-cover rounded-full border border-zinc-700/50"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{user.username}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-400">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {user.isAdmin ? (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-950/30 border border-green-800/30 rounded-full text-green-100 text-xs">
                              <FiShield className="w-3 h-3" />
                              Admin
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-400 text-xs">
                              <FiMinus className="w-3 h-3" />
                              User
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => {
                                setShowModal(true);
                                setUserIdToDelete(user._id);
                              }}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                              disabled={user._id === currentUser._id}
                              title={user._id === currentUser._id ? "Cannot delete yourself" : "Delete user"}
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
                  Show More Users
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center">
              <FiUsers className="w-12 h-12 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">No users found</h3>
            <p className="text-zinc-400">Users will appear here when they register.</p>
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
                  Are you sure you want to delete this user? This action cannot be undone and will permanently remove all their data.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDeleteUser}
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