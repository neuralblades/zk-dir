import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
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

const InputField = ({ label, type, placeholder, id, onChange, icon: Icon, value }) => {
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
          value={value}
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
        Creating Account...
      </div>
    ) : (
      children
    )}
  </motion.button>
);

const Alert = ({ type, children }) => (
  <motion.div 
    className={`border px-4 py-3 rounded-lg text-center backdrop-blur-sm ${
      type === 'success' 
        ? 'bg-green-900/20 border-green-800 text-green-400' 
        : 'bg-red-900/20 border-red-800 text-red-400'
    }`}
    role="alert"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <span className="block sm:inline">{children}</span>
  </motion.div>
);

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const getColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <motion.div 
      className="mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400">Password strength</span>
        <span className={`${strength <= 2 ? 'text-red-400' : strength <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
          {getLabel()}
        </span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
    </motion.div>
  );
};

const SuccessMessage = () => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="mx-auto mb-6 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
      <FiCheck className="w-8 h-8 text-green-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">Account Created!</h3>
    <p className="text-gray-400 mb-8">
      Your account has been successfully created. You can now sign in with your credentials.
    </p>
    <Link 
      to="/sign-in"
      className="bg-zinc-100 hover:bg-white text-black font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 inline-block"
    >
      Continue to Sign In
    </Link>
  </motion.div>
);

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Clear error when component mounts
  useEffect(() => {
    setErrorMessage('');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setErrorMessage('Please fill out all fields');
      return false;
    }

    if (formData.username.length < 3) {
      setErrorMessage('Username must be at least 3 characters long');
      return false;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorMessage('');
      
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success === false) {
        setErrorMessage(data.message);
        return;
      }
      
      if (res.ok) {
        setSuccess(true);
        // Optional: Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/sign-in');
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
        {/* Background glow effect */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
        
        <div className='max-w-md w-full relative z-10'>
          <SuccessMessage />
        </div>
      </div>
    );
  }

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
            Create Account
          </h2>
          <p className="text-gray-400 text-lg">
            Join the ZK Bug Directory community
          </p>
        </motion.div>

        <motion.form 
          className='mt-12 space-y-6' 
          onSubmit={handleSubmit}
          variants={staggerContainer}
        >
          <InputField
            label="Username"
            type="text"
            placeholder="Enter your username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            icon={FiUser}
          />
          <InputField
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            icon={FiMail}
          />
          <div>
            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              icon={FiLock}
            />
            <PasswordStrength password={formData.password} />
          </div>

          <Button type="submit" disabled={loading} loading={loading}>
            Create Account
          </Button>

          <motion.div variants={fadeInUp}>
            <OAuth />
          </motion.div>
        </motion.form>

        <motion.div 
          className='flex gap-2 text-sm mt-8 justify-center'
          variants={fadeInUp}
        >
          <span className="text-gray-400">Already have an account?</span>
          <Link to='/sign-in' className='text-zinc-100 hover:text-white font-medium transition-colors'>
            Sign In
          </Link>
        </motion.div>

        {errorMessage && errorMessage.trim() !== '' && (
          <Alert type="error">{errorMessage}</Alert>
        )}
      </motion.div>
    </div>
  );
}