import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';

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

const InputField = ({ label, type, placeholder, id, value, onChange, icon: Icon }) => (
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
        type={type}
        placeholder={placeholder}
        id={id}
        value={value}
        onChange={onChange}
      />
    </div>
  </motion.div>
);

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
        Sending...
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

const SuccessMessage = ({ email }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="mx-auto mb-6 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
      <FiCheck className="w-8 h-8 text-green-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">Check your email</h3>
    <p className="text-gray-400 mb-6">
      We've sent password reset instructions to:
      <br />
      <span className="text-white font-medium">{email}</span>
    </p>
    <p className="text-sm text-gray-500 mb-8">
      Didn't receive the email? Check your spam folder or try again in a few minutes.
    </p>
    <Link 
      to="/sign-in"
      className="inline-flex items-center text-zinc-100 hover:text-white transition-colors"
    >
      <FiArrowLeft className="w-4 h-4 mr-2" />
      Back to Sign In
    </Link>
  </motion.div>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || email === '') {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setEmailSent(true);
      setMessage('Password reset email sent successfully!');

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value.trim());
    // Clear errors when user starts typing
    if (error) setError('');
    if (message) setMessage('');
  };

  if (emailSent) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8'>
        {/* Background glow effect */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
        
        <div className='max-w-md w-full relative z-10'>
          <SuccessMessage email={email} />
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
          <img className="mx-auto h-12 w-auto mb-8" src="/img/logozk1.png" alt="Logo" />
          <h2 className="text-4xl font-bold text-white mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-400 text-lg">
            No worries, we'll send you reset instructions
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
            value={email}
            onChange={handleChange}
            icon={FiMail}
          />

          <Button type="submit" disabled={loading} loading={loading}>
            Send Reset Instructions
          </Button>
        </motion.form>

        <motion.div 
          className='flex gap-2 text-sm mt-8 justify-center'
          variants={fadeInUp}
        >
          <Link 
            to='/sign-in' 
            className='flex items-center text-gray-400 hover:text-white transition-colors'
          >
            <FiArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </Link>
        </motion.div>

        {error && (
          <Alert type="error">{error}</Alert>
        )}

        {message && (
          <Alert type="success">{message}</Alert>
        )}
      </motion.div>
    </div>
  );
}