import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiBookmark } from 'react-icons/fi';

export default function BookmarkButton({ postId, onToggle }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  // Check if post is bookmarked when component mounts
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!currentUser) {
        setIsBookmarked(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookmark/status/${postId}`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [postId, currentUser]);

  const handleToggleBookmark = async (e) => {
    e.stopPropagation(); // Prevent card click when clicking bookmark
    
    if (!currentUser) {
      // Handle not logged in state - could redirect to login or show a message
      alert('Please log in to bookmark posts');
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const res = await fetch(`/api/bookmark/remove/${postId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (res.ok) {
          setIsBookmarked(false);
          if (onToggle) onToggle(false);
        }
      } else {
        // Add bookmark
        const res = await fetch('/api/bookmark/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ postId })
        });

        if (res.ok) {
          setIsBookmarked(true);
          if (onToggle) onToggle(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`p-2 rounded-lg border border-zinc-700/50 transition-colors duration-200 ${
        isBookmarked 
          ? 'bg-zinc-700/50 text-white border-zinc-600/50' 
          : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
      }`}
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}