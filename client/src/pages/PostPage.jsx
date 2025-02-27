import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);

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
      }
    };
    fetchPost();
  }, [postSlug]);

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
            // Case 1: Handle ReactQuill's code blocks (pre.ql-syntax without code tag)
            contentElement.querySelectorAll('pre.ql-syntax:not(:has(code))').forEach((preBlock) => {
              const code = document.createElement('code');
              code.innerHTML = preBlock.innerHTML;
              preBlock.innerHTML = '';
              preBlock.appendChild(code);
            });
            
            // Apply highlighting to all code blocks
            contentElement.querySelectorAll('pre code').forEach((block) => {
              hljs.highlightElement(block);
            });
            
            // Optional: Add copy button to all code blocks
            contentElement.querySelectorAll('pre').forEach((preBlock) => {
              if (!preBlock.querySelector('.copy-button')) {
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.textContent = 'Copy';
                copyButton.style.position = 'absolute';
                copyButton.style.right = '10px';
                copyButton.style.top = '10px';
                copyButton.style.padding = '4px 8px';
                copyButton.style.backgroundColor = '#444';
                copyButton.style.color = 'white';
                copyButton.style.border = 'none';
                copyButton.style.borderRadius = '4px';
                copyButton.style.fontSize = '12px';
                copyButton.style.cursor = 'pointer';
                copyButton.style.opacity = '0.7';
                
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
                
                // Make preBlock position relative for absolute positioning
                preBlock.style.position = 'relative';
                preBlock.appendChild(copyButton);
              }
            });
          }
        } catch (e) {
          console.error('Error applying syntax highlighting:', e);
        }
      }, 150);
    }
  }, [post]);

  // Helper function to get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };
    return colors[severity] || 'gray';
  };

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );

  if (error)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-red-500'>Error loading post.</p>
      </div>
    );

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      {/* Header Section */}
      <div className="space-y-4 border-b border-zinc-800 pb-6">
        <div className='flex justify-between mt-6'>
          {/* Cover Image */}
          {post?.image && (
            <img
              src={post.image}
              alt={post.title}
              className='max-h-[400px] w-20 object-cover rounded-lg'
            />
          )}
          <h1 className='text-3xl px-4 font-bold text-left'>
            {post?.title}
          </h1>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap justify-left gap-2 text-sm">
          {post?.category && (
            <span className="px-3 py-1 bg-zinc-800 rounded-full">
              {post.category}
            </span>
          )}
          {post?.protocol?.name && (
            <span className="px-3 py-1 bg-zinc-800 rounded-full">
              {post.protocol.name} ({post.protocol.type})
            </span>
          )}
          {post?.severity && (
            <span className={`px-3 py-1 rounded-full bg-${getSeverityColor(post.severity)}-900 text-${getSeverityColor(post.severity)}-300`}>
              {post.severity.toUpperCase()} Severity
            </span>
          )}
          {post?.difficulty && (
            <span className="px-3 py-1 bg-zinc-800 rounded-full">
              {post.difficulty} difficulty
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

        {/* Reporters */}
        {post?.reported_by?.length > 0 && (
          <div className="text-left text-sm text-gray-400">
            Reported by: {post.reported_by.join(', ')}
          </div>
        )}

        {/* Date and Read Time */}
        <div className='flex justify-left gap-4 text-sm text-gray-400'>
          <span>{new Date(post?.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span className='italic'>
            {post && (post.content.length / 1000).toFixed(0)} mins read
          </span>
        </div>
      </div>

      {/* Scope Section */}
      {post?.scope?.length > 0 && (
        <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Scope</h2>
          <div className="space-y-4">
            {post.scope.map((item, index) => (
              <div key={index} className="p-4 bg-zinc-800 rounded-lg">
                <h3 className="font-medium">{item.name}</h3>
                {item.repository && (
                  <a 
                    href={item.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm break-all"
                  >
                    {item.repository}
                  </a>
                )}
                {item.commit_hash && (
                  <p className="text-gray-400 text-sm mt-1">
                    Commit: {item.commit_hash}
                  </p>
                )}
                {item.description && (
                  <p className="text-sm mt-2">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Main Content */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Description</h2>
        <div
          className='post-content prose prose-invert max-w-none'
          dangerouslySetInnerHTML={{ __html: post?.content }}
        />
      </div>

      {/* Target File */}
      {post?.target_file && (
        <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Target File</h2>
          <code className="text-sm break-all">{post.target_file}</code>
        </div>
      )}

      {/* Source Information */}
      {(post?.auditFirm || post?.reportSource?.name) && (
        <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Source</h2>
          {post?.auditFirm && (
            <p className="mb-2">Audit Firm: {post.auditFirm}</p>
          )}
          {post?.reportSource?.name && (
            <div>
              <p>Reported by: {post.reportSource.name}</p>
              {post.reportSource.url && (
                <a 
                  href={post.reportSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  View Original Report
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Finding ID if available */}
      {post?.finding_id && (
        <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Finding ID</h2>
          <p>{post.finding_id}</p>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8">
        <CommentSection postId={post?._id} />
      </div>
    </main>
  );
}