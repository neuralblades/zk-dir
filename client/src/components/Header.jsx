import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import { FaBookmark } from 'react-icons/fa';

export default function Header() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-black effect-hover text-white border-b border-zinc-900 h-[8.3vh] min-h-[64px] px-4 py-2 relative z-50">
      <div className="container mx-auto flex justify-between items-center h-full">
        <Link to='/' className='w-[40px]'>
          <img src="/img/logozk1.png" alt="Logo" className="w-full h-full object-contain" />
        </Link>
        <div className='flex items-center gap-4'>
          {currentUser ? (
            <>
              <Link to='/create-post'>
                <button className='px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-900 transition delay-100 duration-300'>
                  New Post
                </button>
              </Link>
              <Link to='/bookmarks' className="effect-hover">
                <FaBookmark size={20} className={`${path === '/bookmarks' ? 'text-blue-500' : 'text-white'} transition-colors duration-300`} />
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={currentUser.profilePicture}
                    alt="User"
                    className="w-10 h-10 rounded-full effect-hover"
                  />
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-zinc-900 rounded-md shadow-lg py-1">
                    <div className="px-4 py-2 text-sm text-gray-300">
                      <p>{currentUser.username}</p>
                    </div>
                    <Link
                      to="/dashboard?tab=profile"
                      className="block px-4 py-2 text-sm text-white hover:bg-zinc-900"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleSignout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-900"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to='/sign-in'>
              <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-zinc-900 transition delay-100 duration-300">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}