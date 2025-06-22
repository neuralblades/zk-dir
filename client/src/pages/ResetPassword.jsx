import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

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

const InputField = ({ label, type, placeholder, id, value, onChange, icon: Icon }) => {
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
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-12 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all duration-200 hover:border-zinc-600`}
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
        Resetting...
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
    <h3 className="text-2xl font-bold text-white mb-4">Password Reset Complete!</h3>
    <p className="text-gray-400 mb-8">
      Your password has been successfully updated. You can now sign in with your new password.
    </p>
    <button 
      onClick={() => window.location.href = '/sign-in'}
      className="bg-zinc-100 hover:bg-white text-black font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
    >
      Continue to Sign In
    </button>
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

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  
  // Get token from URL
  const token = window.location.pathname.split('/').pop();

  useEffect(() => {
    // Verify token when component mounts
    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-reset-token/${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(data.message || 'Invalid or expired reset token');
        }
      } catch (error) {
        setTokenValid(false);
        setError('Error verifying reset token');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError('No reset token provided');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || password === '') {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError('');
  };

  if (tokenValid === null) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black'>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
          <p className="text-gray-400 mb-8">This password reset link is invalid or has expired.</p>
          <button 
            onClick={() => window.location.href = '/forgot-password'}
            className="bg-zinc-100 hover:bg-white text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
        <div className='max-w-md w-full relative z-10'>
          <SuccessMessage />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
      {/* Background glow effect */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
      
      <motion.div 
        className='max-w-md w-full space-y-8 relative z-10'
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div className="text-center" variants={fadeInUp}>
          <img className="mx-auto h-12 w-auto mb-8" src="/img/logozk1.png" alt="Logo" />
          <h2 className="text-4xl font-bold text-white mb-2">
            Reset Password
          </h2>
          <p className="text-gray-400 text-lg">
            Enter your new password below
          </p>
        </motion.div>

        <motion.form 
          className='mt-12 space-y-6' 
          onSubmit={handleSubmit}
          variants={staggerContainer}
        >
          <div>
            <InputField
              label="New Password"
              type="password"
              placeholder="Enter new password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              icon={FiLock}
            />
            <PasswordStrength password={password} />
          </div>

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            icon={FiLock}
          />

          <Button type="submit" disabled={loading} loading={loading}>
            Reset Password
          </Button>
        </motion.form>

        {error && (
          <Alert type="error">{error}</Alert>
        )}
      </motion.div>
    </div>
  );
}