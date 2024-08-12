// src/pages/BookmarkedPosts.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
        const res = await fetch('/api/post/bookmarked', {
          credentials: 'include' // Important if you're using cookies for authentication
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
    }
  }, [currentUser]);

  const handleRemoveBookmark = (postId) => {
    setBookmarkedPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  if (!currentUser) {
    return <div className='text-center mt-10'>Please sign in to view your bookmarked posts.</div>;
  }

  if (loading) {
    return <div className='text-center mt-10'>Loading...</div>;
  }

  if (error) {
    return <div className='text-center mt-10 text-red-500'>{error}</div>;
  }

  return (
    <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7'>
      <h1 className='text-3xl font-semibold'>Your Bookmarked Posts</h1>
      {bookmarkedPosts.length === 0 ? (
        <p>You havent bookmarked any posts yet.</p>
      ) : (
        <div className='flex flex-wrap gap-4'>
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