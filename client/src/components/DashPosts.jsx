import { Modal, Table, Button, Checkbox } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
          if (data.posts.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchPosts();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(
        `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/post/deletepost/${postIdToDelete}/${currentUser._id}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setUserPosts((prev) =>
          prev.filter((post) => post._id !== postIdToDelete)
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleBulkDelete = async () => {
    setShowModal(false);
    try {
      const res = await fetch('/api/post/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postIds: selectedPosts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        // Remove deleted posts from the state
        setUserPosts((prev) =>
          prev.filter((post) => !selectedPosts.includes(post._id))
        );
        // Reset selection
        setSelectedPosts([]);
        setSelectAll(false);
        setBulkDeleteMode(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      // Deselect all posts
      setSelectedPosts([]);
    } else {
      // Select all posts
      setSelectedPosts(userPosts.map((post) => post._id));
    }
    setSelectAll(!selectAll);
  };

  const togglePostSelection = (postId) => {
    if (selectedPosts.includes(postId)) {
      // Remove from selection
      setSelectedPosts(selectedPosts.filter((id) => id !== postId));
      setSelectAll(false);
    } else {
      // Add to selection
      setSelectedPosts([...selectedPosts, postId]);
      if (selectedPosts.length + 1 === userPosts.length) {
        setSelectAll(true);
      }
    }
  };

  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    if (!bulkDeleteMode) {
      // Entering bulk delete mode
      setSelectedPosts([]);
      setSelectAll(false);
    }
  };

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <div className="flex justify-between mb-4">
            <Button
              color={bulkDeleteMode ? "gray" : "blue"}
              onClick={toggleBulkDeleteMode}
            >
              {bulkDeleteMode ? "Cancel Selection" : "Select Posts"}
            </Button>
            
            {bulkDeleteMode && (
              <div className="flex gap-4">
                <Button
                  color="failure"
                  disabled={selectedPosts.length === 0}
                  onClick={() => {
                    setPostIdToDelete('bulk');
                    setShowModal(true);
                  }}
                >
                  Delete Selected ({selectedPosts.length})
                </Button>
              </div>
            )}
          </div>
          <Table className='shadow-md'>
            <Table.Head className="!text-white">
              {bulkDeleteMode && (
                <Table.HeadCell>
                  <Checkbox 
                    checked={selectAll} 
                    onChange={toggleSelectAll} 
                  />
                </Table.HeadCell>
              )}
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Protocol</Table.HeadCell>
              {!bulkDeleteMode && (
                <>
                  <Table.HeadCell>Delete</Table.HeadCell>
                  <Table.HeadCell>
                    <span>Edit</span>
                  </Table.HeadCell>
                </>
              )}
            </Table.Head>
            {userPosts.map((post) => (
              <Table.Body className='divide-y' key={post._id}>
                <Table.Row className='dark:bg-zinc-900'>
                  {bulkDeleteMode && (
                    <Table.Cell>
                      <Checkbox 
                        checked={selectedPosts.includes(post._id)} 
                        onChange={() => togglePostSelection(post._id)}
                      />
                    </Table.Cell>
                  )}
                  <Table.Cell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/post/${post.slug}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className='w-20 h-10 object-cover bg-gray-500'
                      />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className='font-medium text-gray-900 dark:text-white'
                      to={`/post/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{post.protocol?.name || 'N/A'}</Table.Cell>
                  {!bulkDeleteMode && (
                    <>
                      <Table.Cell>
                        <span
                          onClick={() => {
                            setShowModal(true);
                            setPostIdToDelete(post._id);
                          }}
                          className='font-medium text-red-500 hover:underline cursor-pointer'
                        >
                          Delete
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          className='text-teal-500 hover:underline'
                          to={`/update-post/${post._id}`}
                        >
                          <span>Edit</span>
                        </Link>
                      </Table.Cell>
                    </>
                  )}
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className='w-full text-teal-500 self-center text-sm py-7'
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no posts yet!</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              {postIdToDelete === 'bulk'
                ? `Are you sure you want to delete ${selectedPosts.length} selected posts? This action cannot be undone.`
                : postIdToDelete === 'all'
                ? 'Are you sure you want to delete all your posts? This action cannot be undone.'
                : 'Are you sure you want to delete this post?'}
            </h3>
            <div className='flex justify-center gap-4'>
              <Button 
                color='failure' 
                onClick={postIdToDelete === 'bulk' ? handleBulkDelete : handleDeletePost}
              >
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}