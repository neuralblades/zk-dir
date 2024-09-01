import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PostCard({ post, onClick }) {
  const [username, setUsername] = useState('Anonymous');

  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await fetch(`/api/user/${post.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Anonymous');
      }
    }

    if (post.userId) {
      fetchUsername();
    }
  }, [post.userId]);

  function getSeverityColor(severity) {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  return (
    <div className="border effect-hover border-zinc-900 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer" onClick={onClick}>
      <div className='flex items-center gap-4 mb-2'>
        <Link to={`/post/${post.slug}`} className="flex-shrink-0">
          <img
            src={post.image}
            alt='post cover'
            className='h-12 w-12 object-cover rounded-md'
          />
        </Link>
        <h2 className="text-lg font-semibold line-clamp-2">{post.title}</h2>
      </div>
      <div className="flex justify-between text-xs text-gray-300 mb-2">
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span className="px-2 py-1 bg-black border-2 border-violet-950 rounded-full">{post.category}</span>
        <span>{username}</span>
      </div>
      {post.severity && (
        <div className="mt-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(post.severity)}`}>
            {post.severity}
          </span>
        </div>
      )}
    </div>
  );
}