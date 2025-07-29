import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CommentSection from '../components/CommentSection';
import { FiArrowLeft, FiEdit, FiExternalLink, FiCalendar } from 'react-icons/fi';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
        console.error('Error fetching post:', error);
      }
    };
    
    if (postSlug) {
      fetchPost();
    }
  }, [postSlug]);

  // Apply syntax highlighting when post content loads
  useEffect(() => {
    if (post && post.content) {
      setTimeout(() => {
        try {
          // Configure highlight.js
          hljs.configure({
            ignoreUnescapedHTML: true
          });
          
          const contentElement = document.querySelector('.post-content');
          if (contentElement) {
            console.log('Found content element, applying highlighting...');
            
            // Handle ReactQuill's code blocks (pre.ql-syntax without code tag)
            contentElement.querySelectorAll('pre.ql-syntax:not(:has(code))').forEach((preBlock) => {
              const code = document.createElement('code');
              code.innerHTML = preBlock.innerHTML;
              preBlock.innerHTML = '';
              preBlock.appendChild(code);
              console.log('Wrapped ql-syntax in code tag');
            });
            
            // Also handle any existing pre > code blocks
            contentElement.querySelectorAll('pre:not(.ql-syntax)').forEach((preBlock) => {
              if (!preBlock.querySelector('code')) {
                const code = document.createElement('code');
                code.innerHTML = preBlock.innerHTML;
                preBlock.innerHTML = '';
                preBlock.appendChild(code);
                console.log('Wrapped pre block in code tag');
              }
            });
            
            // Apply highlighting to all code blocks
            const codeBlocks = contentElement.querySelectorAll('pre code');
            console.log('Found code blocks:', codeBlocks.length);
            
            codeBlocks.forEach((block) => {
              hljs.highlightElement(block);
            });
            
            // Add copy button to code blocks
            contentElement.querySelectorAll('pre').forEach((preBlock) => {
              if (!preBlock.querySelector('.copy-button')) {
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.textContent = 'Copy';
                copyButton.style.cssText = `
                  position: absolute;
                  right: 10px;
                  top: 10px;
                  padding: 4px 8px;
                  background-color: #444;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                  opacity: 0.7;
                  z-index: 10;
                `;
                
                copyButton.addEventListener('click', () => {
                  const code = preBlock.querySelector('code');
                  if (code) {
                    navigator.clipboard.writeText(code.textContent);
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                      copyButton.textContent = 'Copy';
                    }, 2000);
                  }
                });
                
                preBlock.style.position = 'relative';
                preBlock.appendChild(copyButton);
              }
            });
            
            console.log('Code highlighting applied successfully');
          } else {
            console.log('Content element not found');
          }
        } catch (e) {
          console.error('Error applying syntax highlighting:', e);
        }
      }, 150);
    }
  }, [post]);

  useEffect(() => {
    if (post) {
      console.log('=== POST DEBUG ===');
      console.log('Post ID:', post._id);
      console.log('Post Title:', post.title);
      console.log('Full post object:', post);
      console.log('Post scope:', post.scope);
      console.log('Scope length:', post.scope?.length);
    }
  }, [post]);

  // Helper function to get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'n/a': 'gray',
      'informational': 'blue',
      'low': 'green',
      'medium': 'yellow',
      'high': 'orange',
      'critical': 'red'
    };
    return colors[severity?.toLowerCase()] || 'gray';
  };

  // Helper to make severity display more user-friendly
  const formatSeverity = (severity) => {
    if (!severity || severity.toLowerCase() === 'n/a') {
      return 'Severity N/A';
    }
    return severity.toUpperCase() + ' Severity';
  };

  // Helper to make difficulty display more user-friendly
  const formatDifficulty = (difficulty) => {
    if (!difficulty || difficulty.toLowerCase() === 'n/a') {
      return 'Difficulty N/A';
    }
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' difficulty';
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-black'>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-black'>
        <div className="text-center">
          <p className='text-red-500 mb-4'>Error loading post.</p>
          <Link to="/home" className="text-zinc-400 hover:text-white flex items-center gap-2 justify-center">
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-black'>
        <div className="text-center">
          <p className='text-zinc-400 mb-4'>Post not found.</p>
          <Link to="/home" className="text-zinc-400 hover:text-white flex items-center gap-2 justify-center">
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen bg-black text-white'>
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          to="/home" 
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Posts
        </Link>
        {currentUser && currentUser.isAdmin && (
          <Link 
            to={`/update-post/${post._id}`}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <FiEdit className="w-4 h-4" />
            Edit Post
          </Link>
        )}
      </div>

      {/* Header Section */}
      <div className="space-y-4 border-b border-zinc-800 pb-6">
        <div className='flex mt-6'>
          {/* Cover Image */}
          {post?.image && (
            <img
              src={post.image}
              alt={post.title}
              className='max-h-[400px] w-20 object-cover rounded-lg mr-4'
            />
          )}
          <h1 className='text-3xl px-4 font-bold text-left'>
            {post?.title}
          </h1>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap justify-left gap-2 text-sm">
          {post?.protocol?.name && (
            <span className="px-3 py-1 bg-zinc-800 rounded-full">
              {post.protocol.name} ({post.protocol.type})
            </span>
          )}
          {post?.type && (
            <span className="px-3 py-1 bg-purple-950/30 border border-purple-800/30 text-purple-100 rounded-full">
              {post.type}
            </span>
          )}
          {post?.severity && post.severity.toLowerCase() !== 'n/a' && (
            <span className={`px-3 py-1 rounded-full bg-${getSeverityColor(post.severity)}-900 text-${getSeverityColor(post.severity)}-300`}>
              {formatSeverity(post.severity)}
            </span>
          )}
          {post?.difficulty && post.difficulty.toLowerCase() !== 'n/a' && (
            <span className="px-3 py-1 bg-zinc-800 rounded-full">
              {formatDifficulty(post.difficulty)}
            </span>
          )}
        </div>

        {/* Tags and Frameworks */}
        {(post?.tags?.length > 0 || post?.frameworks?.length > 0) && (
          <div className="flex flex-wrap justify-left gap-2 text-xs">
            {post?.tags?.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-zinc-900 rounded-md">
                #{tag}
              </span>
            ))}
            {post?.frameworks?.map((framework, index) => (
              <span key={index} className="px-2 py-1 bg-blue-900 rounded-md">
                {framework}
              </span>
            ))}
          </div>
        )}

        {/* Date and Read Time */}
        <div className='flex justify-left gap-4 text-sm text-gray-400'>
          <div className="flex items-center gap-1">
            <FiCalendar className="w-4 h-4" />
            <span>{new Date(post?.createdAt).toLocaleDateString()}</span>
          </div>
          <span>·</span>
          <span className='italic'>
            {post && (post.content.length / 1000).toFixed(0)} mins read
          </span>
        </div>
      </div>

      {/* Enhanced Report Details */}
      {(post?.auditFirm || post?.reportSource?.name || post?.report_url) && (
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Report Details</h2>
          <div className="space-y-3">
            {post?.auditFirm && (
              <div>
                <span className="text-zinc-400">Audit Firm:</span>
                <span className="ml-2 text-white font-medium">{post.auditFirm}</span>
              </div>
            )}
            {post?.reportSource?.name && (
              <div>
                <span className="text-zinc-400">Reported by:</span>
                <span className="ml-2 text-white">{post.reportSource.name}</span>
              </div>
            )}
            {(post?.reportSource?.url || post?.report_url) && (
              <div>
                <a 
                  href={post.reportSource?.url || post.report_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Full Report
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Security Researchers */}
      {post?.reported_by?.length > 0 && (
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-zinc-300 mb-3">Security Researchers</h3>
          <div className="flex flex-wrap gap-2">
            {post.reported_by.map((reporter, index) => (
              <span key={index} className="px-3 py-1 bg-zinc-700 rounded-lg text-sm">
                {reporter}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Scope Section - FIXED */}
      {post?.scope && post.scope.length > 0 && (
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Affected Components</h2>
          <div className="space-y-4">
            {post.scope.map((scope, index) => (
              <div key={index} className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-medium text-lg">{scope.name || `Component ${index + 1}`}</h3>
                  {scope.repository && (
                    <a 
                      href={scope.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-950/30 border border-blue-800/30 text-blue-100 rounded-md text-sm hover:bg-blue-900/30 transition-colors"
                    >
                      <FiExternalLink className="w-3 h-3" />
                      Repository
                    </a>
                  )}
                </div>
                
                <div className="space-y-2">
                  {scope.repository && (
                    <div className="text-sm">
                      <span className="text-zinc-400">Repository:</span>
                      <a 
                        href={scope.repository} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="ml-2 text-blue-400 hover:text-blue-300 break-all font-mono text-xs"
                      >
                        {scope.repository}
                      </a>
                    </div>
                  )}
                  
                  {scope.commit_hash && (
                    <div className="text-sm">
                      <span className="text-zinc-400">Commit:</span>
                      <code className="ml-2 px-2 py-1 bg-zinc-700 rounded text-xs font-mono text-green-400">
                        {scope.commit_hash}
                      </code>
                    </div>
                  )}
                  
                  {scope.description && scope.description.trim() && (
                    <div className="text-sm mt-3">
                      <span className="text-zinc-400">Description:</span>
                      <p className="mt-1 text-zinc-300">{scope.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Description</h2>
        <div
          className='post-content prose prose-invert max-w-none'
          dangerouslySetInnerHTML={{ __html: post?.content }}
        />
      </div>

      {/* Impact and Recommendation */}
      {(post?.impact || post?.recommendation) && (
        <div className="mt-6 space-y-4">
          {post.impact && (
            <div className="p-4 bg-red-900/20 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Impact</h2>
              <p>{post.impact}</p>
            </div>
          )}
          {post.recommendation && (
            <div className="p-4 bg-green-900/20 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Recommendation</h2>
              <p>{post.recommendation}</p>
            </div>
          )}
        </div>
      )}

      {/* Target File */}
      {post?.target_file && (
        <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Target File</h2>
          <code className="text-sm break-all">{post.target_file}</code>
        </div>
      )}

      {/* Finding ID if available */}
      {post?.finding_id && (
        <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Finding ID</h2>
          <p className="font-mono">{post.finding_id}</p>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8">
        <CommentSection postId={post?._id} />
      </div>
    </main>
  );
}