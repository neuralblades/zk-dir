import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const InputField = ({ label, type, placeholder, id, onChange, icon: Icon }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div className="mb-6" variants={fadeInUp}>
      <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all duration-200 hover:border-zinc-600`}
          type={inputType}
          placeholder={placeholder}
          id={id}
          onChange={onChange}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            ) : (
              <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const Button = ({ type, disabled, children, loading }) => (
  <motion.button
    className={`w-full bg-zinc-100 hover:bg-white text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black ${
      disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
    }`}
    type={type}
    disabled={disabled}
    variants={fadeInUp}
    whileHover={!disabled ? { scale: 1.02 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2" />
        Loading...
      </div>
    ) : (
      children
    )}
  </motion.button>
);

const Alert = ({ children }) => (
  <motion.div 
    className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-center backdrop-blur-sm"
    role="alert"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <span className="block sm:inline">{children}</span>
  </motion.div>
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
        navigate('/home');
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  useEffect(() => {
    // Clear any existing error when component mounts
    dispatch(signInFailure(''));
  }, [dispatch]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
      {/* Background glow effect */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
      
      <motion.div 
        className='max-w-md w-full space-y-8 relative z-10'
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div className="text-center" variants={fadeInUp}>
          <Link to='/home'>
            <img className="mx-auto h-12 w-auto mb-8" src="/img/logozk1.png" alt="Logo" />
          </Link>
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-lg">
            Sign in to your account
          </p>
        </motion.div>

        <motion.form 
          className='mt-12 space-y-6' 
          onSubmit={handleSubmit}
          variants={staggerContainer}
        >
          <InputField
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            id="email"
            onChange={handleChange}
            icon={FiMail}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            id="password"
            onChange={handleChange}
            icon={FiLock}
          />
          
          <motion.div className="flex items-center justify-between" variants={fadeInUp}>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-zinc-600 focus:ring-zinc-500 border-zinc-600 rounded bg-zinc-900"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
          </motion.div>

          <Button type="submit" disabled={loading} loading={loading}>
            Sign In
          </Button>

          <motion.div variants={fadeInUp}>
            <OAuth />
          </motion.div>
        </motion.form>

        <motion.div 
          className='flex gap-2 text-sm mt-8 justify-center'
          variants={fadeInUp}
        >
          <span className="text-gray-400">Don't have an account?</span>
          <Link to='/sign-up' className='text-zinc-100 hover:text-white font-medium transition-colors'>
            Sign Up
          </Link>
        </motion.div>

        {errorMessage && typeof errorMessage === 'string' && errorMessage.length > 0 && (
          <Alert>{errorMessage}</Alert>
        )}
      </motion.div>
    </div>
  );
}