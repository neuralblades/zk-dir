import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

const InputField = ({ label, type, placeholder, id, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 bg-zinc-900 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-violet-950"
      type={type}
      placeholder={placeholder}
      id={id}
      onChange={onChange}
    />
  </div>
);

const Button = ({ type, disabled, children }) => (
  <button
    className={`w-full bg-violet-950 hover:bg-zinc-950 border border-violet-950 text-white font-bold py-2 px-4 rounded focus:outline-none ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    type={type}
    disabled={disabled}
  >
    {children}
  </button>
);

const Alert = ({ children }) => (
  <div className="text-red-700 px-4 py-3 text-center relative" role="alert">
    <span className="block sm:inline">{children}</span>
  </div>
);

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage('Please fill out all fields.');
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        return setErrorMessage(data.message);
      }
      setLoading(false);
      if(res.ok) {
        navigate('/sign-in');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[87vh] flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <Link to='/'>
            <img className="mx-auto shadow-bg h-12 w-auto" src="/img/logozk3.png" alt="Logo" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-300">
            Create your account
          </h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <InputField
            label="Your username"
            type="text"
            placeholder="Username"
            id="username"
            onChange={handleChange}
          />
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
            {loading ? 'Loading...' : 'Sign Up'}
          </Button>
          <OAuth />
        </form>
        <div className='flex gap-2 text-sm mt-5 justify-center'>
          <span>Have an account?</span>
          <Link to='/sign-in' className='text-blue-500'>
            Sign In
          </Link>
        </div>
        {errorMessage && (
          <Alert>{errorMessage}</Alert>
        )}
      </div>
    </div>
  );
}