import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiBookmark, FiArrowRight } from 'react-icons/fi';
import PostCard from '../components/PostCard';

export default function BookmarkedPosts() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/bookmark/posts', {
          credentials: 'include'
        });
        if (!res.ok) {
          throw new Error('Failed to fetch bookmarked posts');
        }
        const data = await res.json();
        setBookmarkedPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
        setError('Failed to fetch bookmarked posts. Please try again.');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchBookmarkedPosts();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleRemoveBookmark = (postId) => {
    setBookmarkedPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center">
            <FiBookmark className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6 text-zinc-400 leading-relaxed">
            Please sign in to view and manage your bookmarked posts.
          </p>
          <Link 
            to="/sign-in" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-300 text-black rounded-lg font-medium transition-colors duration-200"
          >
            Sign In
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="p-6 bg-red-950/30 border border-red-800/30 rounded-lg">
            <p className="text-red-100 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-800/50 hover:bg-red-700/50 border border-red-700/50 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Bookmarked Posts</h1>
          <p className="text-zinc-400">
            {bookmarkedPosts.length} {bookmarkedPosts.length === 1 ? 'post' : 'posts'} bookmarked
          </p>
        </div>

        {/* Content */}
        {bookmarkedPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center">
              <FiBookmark className="w-12 h-12 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">No bookmarks yet</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Start bookmarking posts to build your personal collection of interesting bug reports.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors duration-200"
            >
              Browse Posts
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookmarkedPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onRemoveBookmark={handleRemoveBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}