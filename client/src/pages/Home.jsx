import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation} from 'react-router-dom';
import { FiX, FiSearch, FiExternalLink } from 'react-icons/fi';
import PostCard from '../components/PostCard';
import Header from '../components/Header';
import CommentSection from '../components/CommentSection';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Home() {
  // Core state
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: '',
    protocol: '',
    protocolType: '',
    severity: '',
    difficulty: '',
    tags: '',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [hasAutoSelected, setHasAutoSelected] = useState(false); // Track if we've auto-selected

  // Filter state
  const [filterStats, setFilterStats] = useState({
    totalPosts: 0,
    protocols: [],
    severities: [],
  });

  // Refs
  const postsScrollRef = useRef(null);
  const detailScrollRef = useRef(null);

  // Hooks
  const location = useLocation();
  const debouncedSearchTerm = useDebounce(sidebarData.searchTerm, 300);

  // Fetch posts function
  const fetchPosts = useCallback(async (searchParams = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/post/getposts?${searchParams}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await res.json();
      setPosts(data.posts || []);
      setShowMore((data.posts || []).length === 9);
      setFilterStats({
        totalPosts: data.totalPosts || 0,
        protocols: data.stats?.protocols || [],
        severities: data.stats?.severities || []
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setFilterStats({
        totalPosts: 0,
        protocols: [],
        severities: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply syntax highlighting
  const applyCodeHighlighting = useCallback(() => {
    try {
      const contentElement = document.querySelector('.post-content');
      if (contentElement) {
        // Handle ReactQuill's code blocks (pre.ql-syntax without code tag)
        contentElement.querySelectorAll('pre.ql-syntax:not(:has(code))').forEach((preBlock) => {
          const code = document.createElement('code');
          code.innerHTML = preBlock.innerHTML;
          preBlock.innerHTML = '';
          preBlock.appendChild(code);
        });

        // Also handle any existing pre > code blocks that might not have ql-syntax class
        contentElement.querySelectorAll('pre:not(.ql-syntax)').forEach((preBlock) => {
          if (!preBlock.querySelector('code')) {
            const code = document.createElement('code');
            code.innerHTML = preBlock.innerHTML;
            preBlock.innerHTML = '';
            preBlock.appendChild(code);
          }
        });

        // Apply highlighting to all code blocks
        contentElement.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });

        // Add copy buttons with improved styling
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
              transition: opacity 0.2s;
            `;
            
            copyButton.addEventListener('mouseenter', () => {
              copyButton.style.opacity = '1';
            });
            
            copyButton.addEventListener('mouseleave', () => {
              copyButton.style.opacity = '0.7';
            });
            
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
      }
    } catch (e) {
      console.error('Error applying syntax highlighting:', e);
    }
  }, []);

  // Fetch full post for detail view
  const fetchFullPost = useCallback(async (postId) => {
    setLoadingPost(true);
    try {
      const res = await fetch(`/api/post/getposts?postId=${postId}`);
      const data = await res.json();
      if (res.ok && data.posts && data.posts[0]) {
        setSelectedPost(data.posts[0]);
        setTimeout(() => {
          applyCodeHighlighting();
        }, 0);
      }
    } catch (error) {
      console.error('Error fetching full post:', error);
    } finally {
      setLoadingPost(false);
    }
  }, [applyCodeHighlighting]);

  // Handle show more posts
  const handleShowMore = useCallback(async () => {
    const numberOfPosts = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', numberOfPosts);

    try {
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/post/getposts?${searchQuery}`);

      if (!res.ok) {
        throw new Error('Failed to fetch more posts');
      }

      const data = await res.json();
      setPosts(prevPosts => [...prevPosts, ...(data.posts || [])]);
      setShowMore((data.posts || []).length === 9);
    } catch (error) {
      console.error('Error fetching more posts:', error);
    }
  }, [posts.length, location.search]);

  // Header callback handlers
  const handleSearchChange = useCallback((newSearchData) => {
    setSidebarData(newSearchData);
    setHasAutoSelected(false); // Reset auto-selection when search changes
  }, []);

  const handleFiltersChange = useCallback((newFiltersData) => {
    setSidebarData(newFiltersData);
    setHasAutoSelected(false); // Reset auto-selection when filters change
  }, []);

  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
  }, []);

  // Effects
  // Handle URL parameters and initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    
    const paramsToUpdate = [
      'searchTerm', 'sort', 'protocol', 
      'protocolType', 'severity', 'difficulty', 'tags',
    ];

    const newSidebarData = {};
    paramsToUpdate.forEach(param => {
      newSidebarData[param] = urlParams.get(param) || '';
    });

    setSidebarData(prev => ({ ...prev, ...newSidebarData }));
    fetchPosts(urlParams.toString());
  }, [fetchPosts, location.search]);

  // Live search effect
  useEffect(() => {
    if (debouncedSearchTerm !== sidebarData.searchTerm) return;

    const urlParams = new URLSearchParams();
    Object.entries(sidebarData).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    fetchPosts(urlParams.toString());
    
    // Update URL without triggering navigation
    const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
    window.history.replaceState({}, '', newUrl);
  }, [debouncedSearchTerm, fetchPosts, sidebarData]);

  // Auto-select first post when posts load
  useEffect(() => {
    if (posts.length > 0 && !hasAutoSelected && !selectedPost && !loading) {
      setHasAutoSelected(true);
      fetchFullPost(posts[0]._id);
    }
  }, [posts, hasAutoSelected, selectedPost, loading, fetchFullPost]);

  // Scroll to top of detail panel when new post is selected
  useEffect(() => {
    if (selectedPost && detailScrollRef.current) {
      detailScrollRef.current.scrollTop = 0;
    }
  }, [selectedPost]);

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      {/* Header with search bar and inline filters for home page */}
      <Header 
        onSearchChange={handleSearchChange}
        onFiltersChange={handleFiltersChange}
        onViewModeChange={handleViewModeChange}
        searchData={sidebarData}
        filterStats={filterStats}
        viewMode={viewMode}
        showSearch={true}
        showFilters={true}
      />

      <div className="bg-black text-gray-200">
        {/* Main Content with Fixed Height and Separate Scrolling */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6" 
            style={{ height: 'calc(100vh - 140px)' }}
          >
            {/* Posts List with Independent Scroll */}
            <div className={`${selectedPost ? 'lg:col-span-1 hidden lg:block' : 'lg:col-span-3'} transition-all duration-300`}>
              <div 
                ref={postsScrollRef}
                className="overflow-y-auto overflow-x-hidden scroll-smooth border border-zinc-800 rounded-lg bg-zinc-950/50"
                style={{ 
                  height: 'calc(100vh - 140px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#71717a transparent'
                }}
              >
                <div className="p-3">
                  {/* Search Info */}
                  {sidebarData.searchTerm && (
                    <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiSearch className="w-4 h-4" />
                        <span>Searching for: <span className="text-white">{sidebarData.searchTerm}</span></span>
                        {loading && (
                          <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && posts.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                        <FiSearch className="w-12 h-12 text-zinc-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">No bug reports found</h3>
                      <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
                    </div>
                  )}

                  {/* Posts Grid/List */}
                  {!loading && posts.length > 0 && (
                    <div className={`grid gap-4 ${
                      viewMode === 'grid' && !selectedPost 
                        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}>
                      {posts.map((post) => (
                        <PostCard 
                          key={post._id} 
                          post={post} 
                          onClick={() => fetchFullPost(post._id)}
                          isSelected={selectedPost?._id === post._id}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  )}

                  {/* Show More Button */}
                  {showMore && (
                    <div className="text-center mt-6 pb-2">
                      <button
                        onClick={handleShowMore}
                        className="px-6 py-3 bg-zinc-900 border border-zinc-700 text-gray-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        Load More Reports
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Detail Panel with Independent Scroll */}
            {selectedPost && (
              <div 
                className="lg:col-span-2 bg-black rounded-xl border border-zinc-700/50 overflow-hidden opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                style={{ 
                  height: 'calc(100vh - 140px)'
                }}
              >
                {loadingPost ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zinc-100"></div>
                  </div>
                ) : (
                  <div 
                    ref={detailScrollRef}
                    className="h-full overflow-y-auto scroll-smooth"
                    style={{ 
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#71717a transparent'
                    }}
                  >
                    {/* Post Header */}
                    <div className="sticky top-0 bg-black/40 backdrop-blur-lg border-b border-zinc-800/50 p-8 z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
                            {selectedPost.title}
                          </h1>
                          <div className="flex flex-wrap gap-3">
                            {selectedPost.protocol?.name && (
                              <span className="px-4 py-2 bg-zinc-800/80 border border-zinc-700 rounded-full text-sm font-medium text-zinc-100">
                                {selectedPost.protocol.name}
                              </span>
                            )}
                            {selectedPost.type && (
                              <span className="px-4 py-2 bg-purple-950/50 border border-purple-800/50 text-purple-100 rounded-full text-sm font-medium">
                                {selectedPost.type}
                              </span>
                            )}
                            {selectedPost.severity && (
                              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                                selectedPost.severity === 'critical' 
                                  ? 'bg-red-950/50 border-red-800/50 text-red-100' :
                                selectedPost.severity === 'high' 
                                  ? 'bg-orange-950/50 border-orange-800/50 text-orange-100' :
                                selectedPost.severity === 'medium' 
                                  ? 'bg-yellow-950/50 border-yellow-800/50 text-yellow-100' :
                                  'bg-green-950/50 border-green-800/50 text-green-100'
                              }`}>
                                {selectedPost.severity}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPost(null)}
                          className="p-3 hover:bg-zinc-800/50 rounded-full transition-all duration-300 text-zinc-400 hover:text-white"
                        >
                          <FiX className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-8">
                      {/* Meta Information */}
                      <div className="flex flex-wrap gap-6 text-sm text-zinc-400 mb-10 pb-6 border-b border-zinc-800/50">
                        <span className="flex items-center">
                          Published {new Date(selectedPost.publishDate).toLocaleDateString()}
                        </span>
                        {selectedPost.auditFirm && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="flex items-center">By {selectedPost.auditFirm}</span>
                          </>
                        )}
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center">
                          {Math.ceil(selectedPost.content.length / 1000)} min read
                        </span>
                      </div>

                      {/* Enhanced Report Details */}
                      {(selectedPost.auditFirm || selectedPost.reportSource?.name || selectedPost.report_url) && (
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-8">
                          <h3 className="text-lg font-semibold mb-4 text-white">Report Details</h3>
                          <div className="space-y-3">
                            {selectedPost.auditFirm && (
                              <div>
                                <span className="text-zinc-400">Audit Firm:</span>
                                <span className="ml-2 text-white font-medium">{selectedPost.auditFirm}</span>
                              </div>
                            )}
                            {selectedPost.reportSource?.name && (
                              <div>
                                <span className="text-zinc-400">Reported by:</span>
                                <span className="ml-2 text-white">{selectedPost.reportSource.name}</span>
                              </div>
                            )}
                            {(selectedPost.reportSource?.url || selectedPost.report_url) && (
                              <div>
                                <a 
                                  href={selectedPost.reportSource?.url || selectedPost.report_url} 
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
                      {selectedPost.reported_by?.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-8">
                          <h3 className="text-lg font-medium text-zinc-300 mb-3">Security Researchers</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedPost.reported_by.map((reporter, index) => (
                              <span key={index} className="px-3 py-1 bg-zinc-700 rounded-lg text-sm">
                                {reporter}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Scope Section */}
                      {selectedPost.scope?.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-8">
                          <h3 className="text-lg font-semibold mb-4 text-white">Affected Components</h3>
                          <div className="space-y-3">
                            {selectedPost.scope.map((scope, index) => (
                              <div key={index} className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-medium text-white text-lg">{scope.name || `Component ${index + 1}`}</h4>
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
                      <div
                        className="post-content prose prose-invert prose-lg max-w-none mb-12 text-zinc-200 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                      />

                      {/* Impact and Recommendation */}
                      {(selectedPost.impact || selectedPost.recommendation) && (
                        <div className="space-y-6 mb-12">
                          {selectedPost.impact && (
                            <div className="p-6 bg-red-950/30 rounded-xl border border-red-800/30">
                              <h3 className="font-bold text-lg mb-3 text-red-100 flex items-center">
                                <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                                Impact Assessment
                              </h3>
                              <p className="text-zinc-200 leading-relaxed">{selectedPost.impact}</p>
                            </div>
                          )}
                          {selectedPost.recommendation && (
                            <div className="p-6 bg-green-950/30 rounded-xl border border-green-800/30">
                              <h3 className="font-bold text-lg mb-3 text-green-100 flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Recommendation
                              </h3>
                              <p className="text-zinc-200 leading-relaxed">{selectedPost.recommendation}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Target File */}
                      {selectedPost.target_file && (
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-8">
                          <h3 className="text-lg font-semibold mb-3 text-white">Target File</h3>
                          <code className="text-sm break-all bg-zinc-800 px-3 py-2 rounded text-green-400 font-mono">
                            {selectedPost.target_file}
                          </code>
                        </div>
                      )}

                      {/* Finding ID */}
                      {selectedPost.finding_id && (
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-8">
                          <h3 className="text-lg font-semibold mb-3 text-white">Finding ID</h3>
                          <code className="text-sm bg-zinc-800 px-3 py-2 rounded text-yellow-400 font-mono">
                            {selectedPost.finding_id}
                          </code>
                        </div>
                      )}

                      {/* Comments */}
                      <div className="border-t border-zinc-800/50 pt-8">
                        <h3 className="text-xl font-bold mb-6 text-white">Discussion</h3>
                        <CommentSection postId={selectedPost._id} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile: Show back button when post is selected */}
            {selectedPost && (
              <button
                onClick={() => setSelectedPost(null)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}