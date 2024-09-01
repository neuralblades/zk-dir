import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
} from 'react-icons/hi';

const SidebarItem = ({ icon: Icon, label, active, onClick, to, children }) => (
  <li>
    {to ? (
      <Link 
        to={to}
        className={`flex items-center p-2 text-base font-normal rounded-lg ${
          active 
            ? 'bg-zinc-900 text-white'
            : 'text-gray-300 hover:bg-zinc-900'
        }`}
        onClick={onClick}
      >
        {Icon && <Icon className="w-6 h-6 text-gray-400 transition duration-75 group-hover:text-white" />}
        <span className="ml-3 flex-1 whitespace-nowrap">{children}</span>
        {label && (
          <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full">
            {label}
          </span>
        )}
      </Link>
    ) : (
      <button 
        className={`w-full flex items-center p-2 text-base font-normal rounded-lg ${
          active 
            ? 'bg-zinc-900 text-white' 
            : 'text-gray-300 hover:bg-zinc-900'
        }`}
        onClick={onClick}
      >
        {Icon && <Icon className="w-6 h-6 text-gray-400 transition duration-75 group-hover:text-white" />}
        <span className="ml-3 flex-1 whitespace-nowrap text-left">{children}</span>
        {label && (
          <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full">
            {label}
          </span>
        )}
      </button>
    )}
  </li>
);

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

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

  return (
    <aside className="w-full md:w-64 h-full" aria-label="Sidebar">
      <div className="h-full py-4 px-3 bg-zinc-950 rounded">
        <ul className="space-y-2">
          {currentUser && currentUser.isAdmin && (
            <SidebarItem 
              icon={HiChartPie}
              active={tab === 'dash' || !tab}
              to='/dashboard?tab=dash'
            >
              Dashboard
            </SidebarItem>
          )}
          <SidebarItem 
            icon={HiUser}
            active={tab === 'profile'}
            to='/dashboard?tab=profile'
            label={currentUser.isAdmin ? 'Admin' : 'User'}
          >
            Profile
          </SidebarItem>
          {currentUser.isAdmin && (
            <>
              <SidebarItem 
                icon={HiDocumentText}
                active={tab === 'posts'}
                to='/dashboard?tab=posts'
              >
                Posts
              </SidebarItem>
              <SidebarItem 
                icon={HiOutlineUserGroup}
                active={tab === 'users'}
                to='/dashboard?tab=users'
              >
                Users
              </SidebarItem>
              <SidebarItem 
                icon={HiAnnotation}
                active={tab === 'comments'}
                to='/dashboard?tab=comments'
              >
                Comments
              </SidebarItem>
            </>
          )}
          <SidebarItem 
            icon={HiArrowSmRight}
            onClick={handleSignout}
          >
            Sign Out
          </SidebarItem>
        </ul>
      </div>
    </aside>
  );
}