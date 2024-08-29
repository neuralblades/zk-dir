import { Button, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    if (post && post.content) {
      setTimeout(() => {
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
      }, 0);
    }
  }, [post]);

  if (loading)
    return (
      <div className='flex justify-center items-center h-full'>
        <Spinner size='xl' />
      </div>
    );

  if (error)
    return (
      <div className='flex justify-center items-center h-full'>
        <p className='text-red-500'>Error loading post.</p>
      </div>
    );

  return (
    <main className='p-3 flex flex-col max-w-6xl h-full mx-auto overflow-y-auto'>
      <h1 className='text-2xl mt-4 p-2 text-center font-serif'>
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className='self-center mt-2'
      >
        <Button color='gray' pill size='xs'>
          {post && post.category}
        </Button>
      </Link>
      <img
        src={post && post.image}
        alt={post && post.title}
        className='mt-4 p-2 max-h-[300px] w-full object-cover'
      />
      <div className='flex justify-between p-2 border-b border-slate-500 mx-auto w-full text-xs'>
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className='italic'>
          {post && (post.content.length / 1000).toFixed(0)} mins read
        </span>
      </div>
      <div
        className='p-2 w-full post-content border-b border-slate-500'
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>
      <CommentSection postId={post._id} />
    </main>
  );
}