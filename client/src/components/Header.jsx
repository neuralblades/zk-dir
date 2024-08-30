import { Avatar, Button, Dropdown, DropdownDivider, DropdownItem, Navbar} from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import { FaBookmark } from 'react-icons/fa';


export default function Header() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const {currentUser} = useSelector(state => state.user);
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

  const customTheme = {
    root: {
      base: "bg-black px-2 py-2.5 border-gray-900 sm:px-4",
      rounded: {
        on: "rounded",
        off: ""
      },
      bordered: {
        on: "border",
        off: ""
      },
      inner: {
        base: "mx-auto flex flex-wrap items-center justify-between",
        fluid: {
          on: "",
          off: "container"
        }
      }
    },
    // ... you can customize other parts of the Navbar here
  };

  return (
    <Navbar className='border-b-2 ' theme={customTheme}>
      <Link to='/' className='w-[40px]'>
        <img src="img/logozk.png" alt="#" />
      </Link>
      <div className='flex gap-2 md:order-2'>
        <Link to='/create-post'>
          <button className=' px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 border-2 border-gray-700 transition duration-300'>
            New Post
          </button>
        </Link>
        <Link to='/bookmarks' className="m-3">
          <FaBookmark size={20} className={path === '/bookmarks'} />
        </Link>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar 
                alt='user'
                img={currentUser.profilePicture}
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className='block text-sm'>{currentUser.usernsme}</span>
              <span className='block text-sm font-medium truncate'>{currentUser.email}</span>
            </Dropdown.Header>
            <Link to={'/dashboard?tab=profile'}>
              <DropdownItem>Profile</DropdownItem>
            </Link>
            <DropdownDivider />
            <DropdownItem onClick={handleSignout}>Sign Out</DropdownItem>
          </Dropdown>
        ) : (
          <Link to='/sign-in'>
            <Button gradientDuoTone='purpleToBlue' outline>
              Sign In
            </Button>
          </Link>
        )}
        
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === '/'} as={'div'}>
          <Link to='/'>Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === '/about'} as={'div'}>
          <Link to='/about'>About</Link>
        </Navbar.Link>
        <Navbar.Link active={path === '/projects'} as={'div'}>
          <Link to='/projects'>Projects</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
