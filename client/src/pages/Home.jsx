import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';

export default function Home() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: '',
    protocol: '',
    protocolType: '',
    severity: '',
    difficulty: '',
    tags: '',
  });

  // Rest of your state declarations remain the same
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(false);
  const [filterStats, setFilterStats] = useState({
    totalPosts: 0,
    protocols: [],
    severities: [],
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    
    // Update sidebar data from URL params
    const paramsToUpdate = [
      'searchTerm', 'sort', 'protocol', 
      'protocolType', 'severity', 'difficulty', 'tags',
    ];

    const newSidebarData = {};
    paramsToUpdate.forEach(param => {
      newSidebarData[param] = urlParams.get(param) || '';
    });

    setSidebarData(prev => ({ ...prev, ...newSidebarData }));

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/post/getposts?${searchQuery}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await res.json();
        setPosts(data.posts);
        setShowMore(data.posts.length === 9);
        setFilterStats({
          totalPosts: data.totalPosts || 0,
          protocols: data.stats?.protocols || [],
          severities: data.stats?.severities || []
        });
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.search]);

  const fetchFullPost = async (postId) => {
    setLoadingPost(true);
    try {
      const res = await fetch(`/api/post/getposts?postId=${postId}`);
      const data = await res.json();
      if (res.ok) {
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
  };

  const applyCodeHighlighting = () => {
    try {
      const contentElement = document.querySelector('.post-content');
      if (contentElement) {
        contentElement.querySelectorAll('pre.ql-syntax').forEach((preBlock) => {
          const code = document.createElement('code');
          code.innerHTML = preBlock.innerHTML;
          preBlock.innerHTML = '';
          preBlock.appendChild(code);
        });

        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }
    } catch (e) {
      console.error('Error applying syntax highlighting:', e);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    
    // Only add non-empty values to URL
    Object.entries(sidebarData).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    navigate(`/?${urlParams.toString()}`);
    if (isMobileView) setShowSidebar(false);
  };

  const clearFilters = () => {
    setSidebarData({
      searchTerm: '',
      sort: '',
      protocol: '',
      protocolType: '',
      severity: '',
      difficulty: '',
      tags: '',
    });
    navigate('/');
  };

  const handleShowMore = async () => {
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
      setPosts(prevPosts => [...prevPosts, ...data.posts]);
      setShowMore(data.posts.length === 9);
    } catch (error) {
      console.error('Error fetching more posts:', error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  return (
    <div className="mx-auto flex flex-col md:flex-row h-[87vh] overflow-hidden bg-zinc-950 text-gray-200">
      {/* Mobile Toggle Button */}
      {isMobileView && (
        <button onClick={toggleSidebar} className="m-4 px-4 py-2 bg-zinc-900 rounded-md">
          {showSidebar ? 'Hide Filters' : 'Show Filters'}
        </button>
      )}
      
      {/* Enhanced Sidebar */}
      <div className={`${isMobileView ? (showSidebar ? 'block' : 'hidden') : 'block'} effect-hover1 w-full md:w-1/4 border border-zinc-900 bg-black shadow-lg m-4 mr-0 overflow-y-auto`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>

          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            {/* Search */}
            <div className='flex flex-col'>
              <label htmlFor="searchTerm" className='font-semibold mb-1 text-zinc-300'>Search:</label>
              <input
                type="text"
                id="searchTerm"
                placeholder='Search in title, content, impact...'
                value={sidebarData.searchTerm}
                onChange={handleChange}
                className="bg-black text-white border border-zinc-900 rounded p-2 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* Protocol Filters */}
            <div className='flex flex-col'>
              <label htmlFor="protocol" className='font-semibold mb-1 text-zinc-300'>Protocol:</label>
              <select
                id="protocol"
                value={sidebarData.protocol}
                onChange={handleChange}
                className="bg-black text-white border border-zinc-900 rounded p-2"
              >
                <option value="">All Protocols</option>
                {filterStats.protocols.map(protocol => (
                  <option key={protocol} value={protocol}>{protocol}</option>
                ))}
              </select>
            </div>

            <div className='flex flex-col'>
              <label htmlFor="protocolType" className='font-semibold mb-1 text-zinc-300'>Protocol Type:</label>
              <select
                id="protocolType"
                value={sidebarData.protocolType}
                onChange={handleChange}
                className="bg-black text-white border border-zinc-900 rounded p-2"
              >
                <option value="">All Types</option>
                <option value="ZKEVM">ZKEVM</option>
                <option value="ZKTRIE">ZKTRIE</option>
                <option value="L2GETH">L2GETH</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            {/* Severity and Difficulty */}
            <div className='flex gap-2'>
              <div className='flex flex-col flex-1'>
                <label htmlFor="severity" className='font-semibold mb-1 text-zinc-300'>Severity:</label>
                <select
                  id="severity"
                  value={sidebarData.severity}
                  onChange={handleChange}
                  className="bg-black text-white border border-zinc-900 rounded p-2"
                >
                  <option value="">All</option>
                  <option value="N/A">N/A</option>
                  <option value="informational">Informational</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className='flex flex-col flex-1'>
                <label htmlFor="difficulty" className='font-semibold mb-1 text-zinc-300'>Difficulty:</label>
                <select
                  id="difficulty"
                  value={sidebarData.difficulty}
                  onChange={handleChange}
                  className="bg-black text-white border border-zinc-900 rounded p-2"
                >
                  <option value="">All</option>
                  <option value="n/a">N/A</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className='flex flex-col'>
              <label htmlFor="tags" className='font-semibold mb-1 text-zinc-300'>Tags:</label>
              <input
                type="text"
                id="tags"
                placeholder='Comma-separated tags'
                value={sidebarData.tags}
                onChange={handleChange}
                className="bg-black text-white border border-zinc-900 rounded p-2"
              />
            </div>

            {/* Sort */}
            <div className='flex flex-col'>
              <label htmlFor="sort" className='font-semibold mb-1 text-zinc-300'>Sort By:</label>
              <select
                id="sort"
                value={sidebarData.sort}
                onChange={handleChange}
                className="bg-black text-white border border-zinc-900 rounded p-2"
              >
                <option value="">Default</option>
                <option value="desc">Latest First</option>
                <option value="asc">Oldest First</option>
                <option value="severity">Severity (High to Low)</option>
                <option value="difficulty">Difficulty (High to Low)</option>
              </select>
            </div>

            {/* Stats Display */}
            <div className="mt-4 p-3 bg-zinc-900 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Current Filters:</h3>
              <div className="text-xs text-gray-400">
                <p>Total Posts: {filterStats.totalPosts}</p>
                {sidebarData.protocol && <p>Protocol: {sidebarData.protocol}</p>}
                {sidebarData.severity && <p>Severity: {sidebarData.severity}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 border border-zinc-700 transition duration-300"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className={`${selectedPost && isMobileView ? 'hidden' : 'block'} effect-hover1 w-full md:w-1/4 border border-zinc-900 bg-black shadow-lg m-4 mr-0 overflow-y-auto`}>
        <div className="p-4">
          {/* List Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bug Reports</h2>
            <span className="text-sm text-gray-400">{posts.length} items</span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xl text-zinc-700">No bug reports found</p>
              <p className="text-sm text-zinc-600 mt-2">Try adjusting your filters</p>
            </div>
          )}

          {/* Posts List */}
          <div className="flex flex-col gap-3">
            {!loading && posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onClick={() => {
                  fetchFullPost(post._id);
                  if (isMobileView) {
                    setShowSidebar(false);
                  }
                }}
                isSelected={selectedPost?._id === post._id}
              />
            ))}
          </div>

          {/* Show More Button */}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full mt-4 px-4 py-2 bg-zinc-900 text-gray-300 rounded-md hover:bg-zinc-800 transition-colors"
            >
              Show More
            </button>
          )}
        </div>
      </div>

      {/* Post Detail */}
      <div className={`${!selectedPost && isMobileView ? 'hidden' : 'block'} effect-hover1 w-full md:w-1/2 border border-zinc-900 bg-black shadow-lg m-4 overflow-y-auto`}>
        {loadingPost ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        ) : selectedPost ? (
          <div className="p-6 flex flex-col h-full">
            {/* Mobile Back Button */}
            {isMobileView && (
              <button 
                onClick={handleBackToList}
                className="mb-4 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
              >
                ← Back to List
              </button>
            )}

            {/* Post Header */}
            <div className="border-b border-zinc-800 pb-6">
              <h1 className="text-3xl font-bold mb-4">
                {selectedPost.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {/* Protocol Badge */}
                {selectedPost.protocol?.name && (
                  <span className="px-3 py-1 bg-blue-900 rounded-full text-sm">
                    {selectedPost.protocol.name} ({selectedPost.protocol.type})
                  </span>
                )}

                {/* Severity Badge */}
                {selectedPost.severity && (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedPost.severity === 'critical' ? 'bg-red-900 text-red-200' :
                    selectedPost.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                    selectedPost.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-green-900 text-green-200'
                  }`}>
                    {selectedPost.severity} severity
                  </span>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span>Published {new Date(selectedPost.publishDate).toLocaleDateString()}</span>
                {selectedPost.auditFirm && (
                  <>
                    <span>·</span>
                    <span>By {selectedPost.auditFirm}</span>
                  </>
                )}
                
                {selectedPost.reportSource?.name && (
                  <>
                    <span>·</span>
                    <span>
                      Source:{' '}
                      {selectedPost.reportSource.url ? (
                        <a
                          href={selectedPost.reportSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {selectedPost.reportSource.name}
                        </a>
                      ) : (
                        selectedPost.reportSource.name
                      )}
                    </span>
                  </>
                )}
                <span>{(selectedPost.content.length / 1000).toFixed(0)} min read</span>
                {selectedPost.finding_id && (
                  <>
                    <span>·</span>
                    <span>ID: {selectedPost.finding_id}</span>
                  </>
                )}
              </div>
            </div>

            {/* Tags and Frameworks */}
            {(selectedPost.tags?.length > 0 || selectedPost.frameworks?.length > 0) && (
              <div className="flex flex-wrap gap-2 my-4">
                {selectedPost.tags?.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-zinc-900 rounded text-sm">
                    #{tag}
                  </span>
                ))}
                {selectedPost.frameworks?.map((framework, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-900 rounded text-sm">
                    {framework}
                  </span>
                ))}
              </div>
            )}

            {/* Scope Section */}
            {selectedPost.scope?.length > 0 && (
              <div className="my-6 p-4 bg-zinc-900 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Scope</h2>
                <div className="space-y-4">
                  {selectedPost.scope.map((item, index) => (
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
            {(selectedPost.impact || selectedPost.recommendation) && (
              <div className="space-y-4 my-6">
                {selectedPost.impact && (
                  <div className="p-4 bg-red-900/20 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Impact</h2>
                    <p>{selectedPost.impact}</p>
                  </div>
                )}
                {selectedPost.recommendation && (
                  <div className="p-4 bg-green-900/20 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Recommendation</h2>
                    <p>{selectedPost.recommendation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Main Content */}
            <div className="my-6">
              <div
                className="post-content prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              ></div>
            </div>

            {/* Reporters */}
            {selectedPost.reported_by?.length > 0 && (
              <div className="mt-6 border-t border-zinc-800 pt-4">
                <h2 className="text-lg font-semibold mb-2">Reported By</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.reported_by.map((reporter, index) => (
                    <span key={index} className="px-3 py-1 bg-zinc-800 rounded-full text-sm">
                      {reporter}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-8 border-t border-zinc-800 pt-6">
              <CommentSection postId={selectedPost._id} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-700">
            <p className="text-xl">Select a bug report to view details</p>
            <p className="text-sm mt-2">Click on any item from the list to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
}