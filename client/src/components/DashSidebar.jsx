import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import {
  FiUser,
  FiLogOut,
  FiFileText,
  FiUsers,
  FiMessageCircle,
  FiPieChart,
  FiShield,
} from 'react-icons/fi';

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

  const menuItems = [
    ...(currentUser?.isAdmin ? [{
      id: 'dash',
      icon: FiPieChart,
      label: 'Dashboard',
      to: '/dashboard?tab=dash',
      active: tab === 'dash' || !tab
    }] : []),
    {
      id: 'profile',
      icon: FiUser,
      label: 'Profile',
      to: '/dashboard?tab=profile',
      active: tab === 'profile',
      badge: currentUser?.isAdmin ? 'Admin' : null
    },
    ...(currentUser?.isAdmin ? [
      {
        id: 'posts',
        icon: FiFileText,
        label: 'Posts',
        to: '/dashboard?tab=posts',
        active: tab === 'posts'
      },
      {
        id: 'users',
        icon: FiUsers,
        label: 'Users',
        to: '/dashboard?tab=users',
        active: tab === 'users'
      },
      {
        id: 'comments',
        icon: FiMessageCircle,
        label: 'Comments',
        to: '/dashboard?tab=comments',
        active: tab === 'comments'
      }
    ] : [])
  ];

  return (
    <aside className="w-full md:w-56 h-full bg-zinc-950" aria-label="Sidebar">
      <div className="h-full py-6 px-4">
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    item.active
                      ? 'bg-zinc-800 text-white border-l-2 border-zinc-100'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-300 rounded-full">
                      <FiShield className="w-3 h-3 mr-1" />
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            
            {/* Sign Out Button */}
            <li className="pt-4 border-t border-zinc-800/50">
              <button
                onClick={handleSignout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors duration-200"
              >
                <FiLogOut className="w-5 h-5 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}