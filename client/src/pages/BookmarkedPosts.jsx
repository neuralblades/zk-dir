import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';  // Added this import
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center p-8 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Please sign in to view and manage your bookmarked posts.
          </p>
          <Link 
            to="/sign-in" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-500 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen p-3 flex flex-col gap-8 py-7">
      <h1 className="text-3xl font-semibold">Your Bookmarked Posts</h1>
      {bookmarkedPosts.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-lg text-gray-600 dark:text-gray-400">You haven't bookmarked any posts yet.</p>
          <Link 
            to="/" 
            className="inline-block mt-4 text-blue-500 hover:underline"
          >
            Browse posts to bookmark
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}