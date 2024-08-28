import { Avatar, Button, Dropdown, DropdownDivider, DropdownItem, Navbar} from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
// import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector,useDispatch } from 'react-redux';
// import { toggleTheme } from '../redux/theme/themeSlice'
import { signoutSuccess } from '../redux/user/userSlice';
import { FaBookmark } from 'react-icons/fa';


export default function Header() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const {currentUser} = useSelector(state => state.user);
  // const { theme } =  useSelector((state =>state.theme));
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
      base: "bg-gray-900 px-2 py-2.5 dark:border-gray-700 dark:bg-gray-950 sm:px-4",
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
    <Navbar className='border-b-2' theme={customTheme}>
      <Link to='/' className='w-[50px]'>
        <img src="img/logoz.png" alt="#" />
      </Link>
      <div className='flex gap-2 md:order-2'>
        <Link to='/bookmarks' className="m-3">
          <FaBookmark size={20} className={path === '/bookmarks'} />
        </Link>
        {/* <Button
          className='w-12 h-10 hidden sm:inline'
          color='gray'
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button> */}
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
