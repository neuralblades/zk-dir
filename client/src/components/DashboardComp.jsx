import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiMessageCircle,
  FiFileText,
  FiTrendingUp,
  FiExternalLink
} from 'react-icons/fi';

export default function DashboardComp() {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async (endpoint, setter, totalSetter, lastMonthSetter) => {
      try {
        const res = await fetch(`/api/${endpoint}/get${endpoint}s?limit=5`);
        const data = await res.json();
        if (res.ok) {
          setter(data[`${endpoint}s`]);
          totalSetter(data[`total${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}s`]);
          lastMonthSetter(data[`lastMonth${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}s`]);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin) {
      fetchData('user', setUsers, setTotalUsers, setLastMonthUsers);
      fetchData('post', setPosts, setTotalPosts, setLastMonthPosts);
      fetchData('comment', setComments, setTotalComments, setLastMonthComments);
    }
  }, [currentUser]);

  const StatCard = ({ title, value, icon: Icon, lastMonth, color }) => (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-green-400">
          <FiTrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+{lastMonth}</span>
        </div>
        <span className="text-zinc-500 text-sm">this month</span>
      </div>
    </div>
  );

  const DataTable = ({ title, data, link, children }) => (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <Link
          to={link}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors duration-200"
        >
          See all
          <FiExternalLink className="w-4 h-4" />
        </Link>
      </div>
      <div className="p-6">
        {data.length > 0 ? (
          <div className="space-y-3">
            {children}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-zinc-400">Monitor your platform's key metrics and recent activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={FiUsers}
            lastMonth={lastMonthUsers}
            color="bg-blue-950/30 text-blue-400"
          />
          <StatCard
            title="Total Comments"
            value={totalComments}
            icon={FiMessageCircle}
            lastMonth={lastMonthComments}
            color="bg-green-950/30 text-green-400"
          />
          <StatCard
            title="Total Posts"
            value={totalPosts}
            icon={FiFileText}
            lastMonth={lastMonthPosts}
            color="bg-purple-950/30 text-purple-400"
          />
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <DataTable title="Recent Users" data={users} link="/dashboard?tab=users">
            {users.map((user, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border border-zinc-700/50 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{user.username}</p>
                  <p className="text-sm text-zinc-400 truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </DataTable>

          {/* Recent Comments */}
          <DataTable title="Recent Comments" data={comments} link="/dashboard?tab=comments">
            {comments.map((comment, index) => (
              <div key={index} className="p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-sm text-white line-clamp-2 mb-2">{comment.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <FiMessageCircle className="w-3 h-3 text-zinc-500" />
                    <span className="text-xs text-zinc-500">{comment.numberOfLikes || 0} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </DataTable>

          {/* Recent Posts */}
          <DataTable title="Recent Posts" data={posts} link="/dashboard?tab=posts">
            {posts.map((post, index) => (
              <div key={index} className="flex gap-3 p-3 bg-zinc-800/30 rounded-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-12 h-12 rounded-lg border border-zinc-700/50 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white line-clamp-2 text-sm mb-1">{post.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      {post.protocol?.name || 'N/A'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </DataTable>
        </div>
      </div>
    </div>
  );
}