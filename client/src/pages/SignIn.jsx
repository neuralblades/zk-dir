import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

const InputField = ({ label, type, placeholder, id, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-900 text-gray-200 leading-tight focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-gray-950"
      type={type}
      placeholder={placeholder}
      id={id}
      onChange={onChange}
    />
  </div>
);

const Button = ({ type, disabled, children }) => (
  <button
    className={` w-full bg-gray-200 hover:bg-zinc-100 transition delay-100 duration-300 border border-blue-800 text-black font-bold py-2 px-4 rounded focus:outline-none ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    type={type}
    disabled={disabled}
  >
    {children}
  </button>
);

const Alert = ({ children }) => (
  <div className=" text-red-700 px-4 py-3 text-center relative" role="alert">
    <span className="block sm:inline">{children}</span>
  </div>
);

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill out all the fields'));
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className='min-h-[87vh] flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <img className="mx-auto h-12 w-auto" src="/img/logozk1.png" alt="Logo" />
          <h2 className="mt-6 text-center font-bold text-3xl text-gray-100">
            LOGIN
          </h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <InputField
            label="Your email"
            type="email"
            placeholder="name@company.com"
            id="email"
            onChange={handleChange}
          />
          <InputField
            label="Your password"
            type="password"
            placeholder="Password"
            id="password"
            onChange={handleChange}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </Button>
          <OAuth />
        </form>
        <div className='flex gap-2 text-sm mt-5 justify-center'>
          <span>Don&apos;t have an account?</span>
          <Link to='/sign-up' className='text-blue-500'>
            Sign Up
          </Link>
        </div>
        {errorMessage && (
          <Alert>{errorMessage}</Alert>
        )}
      </div>
    </div>
  );
}