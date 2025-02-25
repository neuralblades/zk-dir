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
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-orange-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  function getDifficultyColor(difficulty) {
    switch (difficulty?.toLowerCase()) {
      case 'high':
        return 'bg-purple-600 text-white';
      case 'medium':
        return 'bg-purple-500 text-white';
      case 'low':
        return 'bg-purple-400 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  return (
    <div 
      className="border effect-hover border-zinc-900 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer rounded-lg" 
      onClick={onClick}
    >
      <div className='flex gap-4 mb-3'>
        <Link to={`/post/${post.slug}`} className="flex-shrink-0">
          <img
            src={post.image}
            alt='post cover'
            className='h-16 w-16 object-cover rounded-lg'
          />
        </Link>
        <div className="flex flex-col flex-grow">
          <h2 className="text-lg font-semibold line-clamp-2 mb-2">{post.title}</h2>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span>{username}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-300 mb-2">
            {/* Use publishDate instead of createdAt */}
            <span>{new Date(post.publishDate).toLocaleDateString()}</span>
            {post.auditFirm && (
              <span className="text-blue-400">{post.auditFirm}</span>
            )}
          </div>
        </div>
      </div>

      {/* Report Source Link */}
      {post.reportSource?.name && (
        <div className="mt-2 text-sm">
          <span className="text-gray-400">Source: </span>
          {post.reportSource.url ? (
            <a
              href={post.reportSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {post.reportSource.name}
            </a>
          ) : (
            <span>{post.reportSource.name}</span>
          )}
        </div>
      )}


      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Category */}
        <span className="px-2 py-1 bg-zinc-900 text-xs rounded-full">
          {post.category}
        </span>

        {/* Protocol */}
        {post.protocol?.name && (
          <span className="px-2 py-1 bg-blue-900 text-xs rounded-full">
            {post.protocol.name}
          </span>
        )}

        {/* Protocol Type */}
        {post.protocol?.type && (
          <span className="px-2 py-1 bg-indigo-900 text-xs rounded-full">
            {post.protocol.type}
          </span>
        )}
      </div>

      {/* Severity and Difficulty */}
      <div className="flex flex-wrap gap-2">
        {post.severity && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(post.severity)}`}>
            {post.severity} severity
          </span>
        )}
        {post.difficulty && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(post.difficulty)}`}>
            {post.difficulty} difficulty
          </span>
        )}
      </div>

      {/* Tags and Frameworks */}
      {(post.tags?.length > 0 || post.frameworks?.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-3 text-xs">
          {post.tags?.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-zinc-800 rounded">
              #{tag}
            </span>
          ))}
          {post.frameworks?.map((framework, index) => (
            <span key={index} className="px-2 py-0.5 bg-zinc-800 rounded text-blue-400">
              {framework}
            </span>
          ))}
        </div>
      )}

      {/* Finding ID */}
      {post.finding_id && (
        <div className="mt-3 text-xs text-gray-400">
          ID: {post.finding_id}
        </div>
      )}
    </div>
  );
}