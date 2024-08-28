import { Button, Select, TextInput, Spinner } from 'flowbite-react';
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
    category: '',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(false);

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
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');

    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData(prevData => ({
        ...prevData,
        searchTerm: searchTermFromUrl || '',
        sort: sortFromUrl || '',
        category: categoryFromUrl || '',
      }));
    }

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
    setSidebarData(prevData => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(sidebarData);
    navigate(`/?${urlParams.toString()}`);
    if (isMobileView) {
      setShowSidebar(false);
    }
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

  return (
    <div className="mx-auto flex flex-col md:flex-row h-screen overflow-hidden bg-gray-900 text-gray-200">
      {isMobileView && (
        <Button onClick={toggleSidebar} className="m-4">
          {showSidebar ? 'Hide Filters' : 'Show Filters'}
        </Button>
      )}
      
      {/* Sidebar */}
      <div className={`${isMobileView ? (showSidebar ? 'block' : 'hidden') : 'block'} w-full md:w-1/4 border border-gray-700 bg-gray-950 rounded-lg shadow-lg m-4 mr-0`}>
        <div className="p-4">
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div className='flex flex-col'>
              <label className='font-semibold mb-1'>Search Term:</label>
              <TextInput
                placeholder='Search...'
                id='searchTerm'
                type='text'
                value={sidebarData.searchTerm}
                onChange={handleChange}
              />
            </div>
            <div className='flex flex-col'>
              <label className='font-semibold mb-1'>Sort:</label>
              <Select onChange={handleChange} value={sidebarData.sort} id='sort'>
                <option value=''>Default</option>
                <option value='desc'>Latest</option>
                <option value='asc'>Oldest</option>
              </Select>
            </div>
            <div className='flex flex-col'>
              <label className='font-semibold mb-1'>Category:</label>
              <Select
                onChange={handleChange}
                value={sidebarData.category}
                id='category'
              >
                <option value=''>Default</option>
                <option value='uncategorized'>Uncategorized</option>
                <option value='reactjs'>React.js</option>
                <option value='nextjs'>Next.js</option>
                <option value='javascript'>JavaScript</option>
              </Select>
            </div>
            <Button type='submit' outline color="light">
              Apply Filters
            </Button>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className={`${selectedPost && isMobileView ? 'hidden' : 'block'} w-full md:w-1/4 border border-gray-700 bg-gray-950 rounded-lg shadow-lg m-4 mr-0 overflow-y-auto`}>
        <div className="p-4">
          {!loading && posts.length === 0 && (
            <p className='text-xl text-gray-500'>No posts found.</p>
          )}
          {loading && <p className='text-xl text-gray-500'>Loading...</p>}
          <div className="flex flex-col gap-2">
            {!loading &&
              posts &&
              posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onClick={() => {
                    fetchFullPost(post._id);
                    if (isMobileView) {
                      setShowSidebar(false);
                    }
                  }}
                />
              ))}
            {showMore && (
              <button
                onClick={handleShowMore}
                className='dark:text-white text-gray-800 text-lg hover:underline p-2 w-full'
              >
                Show More
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post Detail */}
      <div className={`${!selectedPost && isMobileView ? 'hidden' : 'block'} w-full md:w-1/2 border border-gray-700 bg-gray-950 rounded-lg shadow-lg m-4 overflow-y-auto`}>
        {loadingPost ? (
          <div className='flex justify-center items-center h-full'>
            <Spinner size='xl' />
          </div>
        ) : selectedPost ? (
          <div className='p-3 flex flex-col h-full'>
            <h1 className='text-2xl mt-4 p-2 text-center font-serif'>
              {selectedPost.title}
            </h1>
            <Button color='gray' pill size='xs' className='self-center mt-2'>
              {selectedPost.category}
            </Button>
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className='mt-4 p-2 max-h-[300px] w-full object-cover'
            />
            <div className='flex justify-between p-2 border-b border-slate-500 mx-auto w-full text-xs'>
              <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
              <span className='italic'>
                {(selectedPost.content.length / 1000).toFixed(0)} mins read
              </span>
            </div>
            <div
              className='p-2 w-full post-content border-b border-slate-500'
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            ></div>
            <CommentSection postId={selectedPost._id} />
          </div>
        ) : (
          <div className="p-4 text-gray-500">Select an item to view details</div>
        )}
      </div>
    </div>
  );
}