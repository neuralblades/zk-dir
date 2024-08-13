import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = (e) => {
    e.preventDefault(); // Prevent navigating to the post when clicking the bookmark button
    setIsBookmarked(!isBookmarked);
    
    // Here you would typically update your backend or local storage
    // For example:
    // if (!isBookmarked) {
    //   saveBookmark(post.id);
    // } else {
    //   removeBookmark(post.id);
    // }
  };

  return (
    <div className='group relative w-full border border-gray-500 hover:border-2 h-[380px] overflow-hidden rounded-lg sm:w-[350px] transition-all'>
      <Link to={`/post/${post.slug}`}>
        <img
          src={post.image}
          alt='post cover'
          className='h-[260px] w-full object-cover group-hover:h-[200px] transition-all duration-300 z-20'
        />
      </Link>
      <div className='p-3 flex flex-col gap-2'>
        <div className='flex justify-between items-start'>
          <p className='text-lg font-semibold line-clamp-2 flex-grow'>{post.title}</p>
          <button 
            onClick={handleBookmark}
            className='text-gray-500 hover:text-gray-600 focus:outline-none'
          >
            {isBookmarked ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        </div>
        <span className='italic text-sm'>{post.category}</span>
        <Link
          to={`/post/${post.slug}`}
          className='z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2'
        >
          Read article
        </Link>
      </div>
    </div>
  );
}
