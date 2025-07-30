import { Link } from 'react-router-dom';
import { FiExternalLink, FiCalendar, FiTag } from 'react-icons/fi';
import BookmarkButton from './BookmarkButton';

export default function PostCard({ post, onClick, onRemoveBookmark, isSelected }) {
  const handleBookmarkToggle = (isBookmarked) => {
    if (!isBookmarked && onRemoveBookmark) {
      onRemoveBookmark(post._id);
    }
  };

  function getSeverityColor(severity) {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-950/30 border-red-800/30 text-red-100';
      case 'high':
        return 'bg-orange-950/30 border-orange-800/30 text-orange-100';
      case 'medium':
        return 'bg-yellow-950/30 border-yellow-800/30 text-yellow-100';
      case 'low':
        return 'bg-green-950/30 border-green-800/30 text-green-100';
      default:
        return 'bg-zinc-800/30 border-zinc-700/30 text-zinc-200';
    }
  }

  function getDifficultyColor(difficulty) {
    switch (difficulty?.toLowerCase()) {
      case 'high':
        return 'bg-red-950/30 border-red-800/30 text-red-100';
      case 'medium':
        return 'bg-yellow-950/30 border-yellow-800/30 text-yellow-100';
      case 'low':
        return 'bg-green-950/30 border-green-800/30 text-green-100';
      default:
        return 'bg-zinc-800/30 border-zinc-700/30 text-zinc-200';
    }
  }

  function getProtocolTypeColor(type) {
    switch (type?.toLowerCase()) {
      case 'informational':
        return 'bg-green-950/30 border-green-800/30 text-green-100';
      case 'zktrie':
        return 'bg-blue-950/30 border-blue-800/30 text-blue-100';
      default:
        return 'bg-zinc-800/30 border-zinc-700/30 text-zinc-200';
    }
  }

  return (
    <div 
      className="relative overflow-hidden rounded-xl border border-zinc-800/50 cursor-pointer"
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute inset-0 border border-zinc-500/50 bg-zinc-800/20 rounded-xl pointer-events-none" />
      )}
      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex gap-4 mb-4">
          {/* Thumbnail */}
          {/* <div className="flex-shrink-0">
            <img
              src={post.image}
              alt="post cover"
              className="h-16 w-16 object-cover rounded-lg border border-zinc-700"
            />
          </div> */}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-3">
              <div className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                <span>{new Date(post.publishDate).toLocaleDateString()}</span>
              </div>
              {post.auditFirm && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300 font-medium">{post.auditFirm}</span>
                </>
              )}
              {/* {post.finding_id && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-mono text-xs">ID: {post.finding_id}</span>
                </>
              )} */}
              {post.protocol?.name && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-xs">{post.protocol.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-start gap-2">
            <Link 
              to={`/post/${post.slug}`}
              className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink className="w-4 h-4" />
            </Link>
            {/* Bookmark Button */}
            <BookmarkButton 
              postId={post._id} 
              onToggle={handleBookmarkToggle}
            />
          </div>
        </div>

        {/* Tags Section */}
        <div className="flex flex-wrap gap-2">
          {/* Protocol Type */}
          {post.protocol?.type && (
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${getProtocolTypeColor(post.protocol.type)}`}>
              <FiTag className="w-3 h-3" />
              {post.protocol.type}
            </span>
          )}

          {/* Severity */}
          {post.severity && (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getSeverityColor(post.severity)}`}>
              {post.severity}
            </span>
          )}

          {/* Difficulty */}
          {post.difficulty && (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getDifficultyColor(post.difficulty)}`}>
              {post.difficulty}
            </span>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-2 h-2 bg-zinc-100 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}