import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

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

  const handleToggleBookmark = async () => {
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
      className="flex items-center text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? 
        <BsBookmarkFill className="text-blue-500 dark:text-blue-400" size={18} /> : 
        <BsBookmark size={18} />
      }
    </button>
  );
}