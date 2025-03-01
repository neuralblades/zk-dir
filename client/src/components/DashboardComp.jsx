import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
} from 'react-icons/hi';

const StatCard = ({ title, value, icon: Icon, lastMonth }) => (
  <div className='flex flex-col p-3 bg-zinc-900 gap-4 md:w-72 w-full rounded-md shadow-md'>
    <div className='flex justify-between'>
      <div>
        <h3 className='text-gray-500 text-md uppercase'>{title}</h3>
        <p className='text-2xl'>{value}</p>
      </div>
      <Icon className='bg-zinc-950 border border-zinc-700 effect-hover2 text-white rounded-full text-5xl p-3 shadow-lg' />
    </div>
    <div className='flex gap-2 text-sm'>
      <span className='text-green-500 flex items-center'>
        <HiArrowNarrowUp />
        {lastMonth}
      </span>
      <div className='text-gray-500'>Last month</div>
    </div>
  </div>
);

const CustomTable = ({ title, data, columns, link }) => (
  <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md bg-zinc-900'>
    <div className='flex justify-between p-3 text-sm font-semibold'>
      <h1 className='text-center p-2'>{title}</h1>
      <button className='bg-zinc-950 border border-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-800'>
        <Link to={link}>See all</Link>
      </button>
    </div>
    <table className='min-w-full divide-y divide-zinc-800'>
      <thead className='bg-zinc-950'>
        <tr>
          {columns.map((column, index) => (
            <th key={index} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className='bg-zinc-900 divide-y divide-zinc-800'>
        {data.map((item, index) => (
          <tr key={index}>
            {columns.map((column, colIndex) => (
              <td key={colIndex} className='px-6 py-4 whitespace-nowrap'>
                {column === 'User image' && (
                  <img src={item.profilePicture} alt="user" className='w-10 h-10 rounded-full bg-gray-500' />
                )}
                {column === 'Post image' && (
                  <img src={item.image} alt="post" className='w-14 h-10 rounded-md bg-zinc-900' />
                )}
                {column === 'Username' && item.username}
                {column === 'Post Title' && item.title}
                {column === 'Protocol' && (item.protocol?.name || 'N/A')}
                {column === 'Likes' && item.numberOfLikes}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function DashboardComp() {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async (endpoint, setter, totalSetter, lastMonthSetter) => {
      try {
        const res = await fetch(`/api/${endpoint}/get${endpoint}s?limit=5`);
        const data = await res.json();
        if (res.ok) {
          setter(data[`${endpoint}s`]);
          totalSetter(data[`total${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}s`]);
          lastMonthSetter(data[`lastMonth${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}s`]);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin) {
      fetchData('user', setUsers, setTotalUsers, setLastMonthUsers);
      fetchData('post', setPosts, setTotalPosts, setLastMonthPosts);
      fetchData('comment', setComments, setTotalComments, setLastMonthComments);
    }
  }, [currentUser]);

  return (
    <div className='p-3 md:mx-auto'>
      <div className='flex-wrap flex gap-4 justify-center'>
        <StatCard title="Total Users" value={totalUsers} icon={HiOutlineUserGroup} lastMonth={lastMonthUsers} />
        <StatCard title="Total Comments" value={totalComments} icon={HiAnnotation} lastMonth={lastMonthComments} />
        <StatCard title="Total Posts" value={totalPosts} icon={HiDocumentText} lastMonth={lastMonthPosts} />
      </div>
      <div className='flex flex-wrap gap-4 py-3 mx-auto justify-center'>
        <CustomTable 
          title="Recent users" 
          data={users} 
          columns={['User image', 'Username']} 
          link='/dashboard?tab=users' 
        />
        <CustomTable 
          title="Recent comments" 
          data={comments} 
          columns={['Comment content', 'Likes']} 
          link='/dashboard?tab=comments' 
        />
        <CustomTable 
          title="Recent posts" 
          data={posts} 
          columns={['Post image', 'Post Title', 'Protocol']} 
          link='/dashboard?tab=posts' 
        />
      </div>
    </div>
  );
}