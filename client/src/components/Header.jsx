import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { signoutSuccess } from '../redux/user/userSlice';
import { 
  FiBookmark, 
  FiPlus, 
  FiUser, 
  FiLogOut, 
  FiSettings,
  FiChevronDown,
  FiHome,
  FiMenu,
  FiX,
  FiSearch,
  FiFilter,
  FiList,
  FiGrid,
  FiShare2,
  FiCheck
} from 'react-icons/fi';

export default function Header({ 
  onSearchChange, 
  onFiltersChange,
  searchData = {},
  filterStats = {},
  viewMode = 'list',
  onViewModeChange,
  showSearch = false,
  showFilters = false
}) {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Search and autocomplete states
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const filterPanelRef = useRef(null);

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

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    onFiltersChange?.({ ...searchData, [id]: value });
  };

  const applyFilters = () => {
    setShowFilterPanel(false);
  };

  const shareFilters = async () => {
    try {
      // Create URL with current filter parameters
      const params = new URLSearchParams();
      
      // Add non-empty filter values to URL params
      Object.entries(searchData).forEach(([key, value]) => {
        if (value && value !== '' && key !== 'searchTerm') {
          params.append(key, value);
        }
      });

      // Generate the shareable URL
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success feedback
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback: create a temporary input to copy
      const textArea = document.createElement('textarea');
      const params = new URLSearchParams();
      Object.entries(searchData).forEach(([key, value]) => {
        if (value && value !== '' && key !== 'searchTerm') {
          params.append(key, value);
        }
      });
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
      
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 2000);
    }
  };

  const clearFilters = () => {
    const clearedData = {
      searchTerm: searchData.searchTerm || '', // Keep search term
      sort: '',
      protocol: '',
      protocolType: '',
      severity: '',
      difficulty: '',
      tags: '',
    };
    onFiltersChange?.(clearedData);
    setShowFilterPanel(false);
  };

  const getActiveFiltersCount = () => {
    const filterFields = ['sort', 'protocol', 'protocolType', 'severity', 'difficulty', 'tags'];
    return filterFields.filter(field => searchData[field] && searchData[field] !== '').length;
  };

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/post/search-suggestions?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  // Fetch suggestions when search term changes
  useEffect(() => {
    fetchSuggestions(searchData.searchTerm);
  }, [searchData.searchTerm, fetchSuggestions]);

  // Handle outside clicks and scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
      // Check if the click is outside the filter panel AND not on the filter button
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        // Find the filter button element
        const filterButton = document.querySelector('[data-filter-button]');
        if (filterButton && !filterButton.contains(event.target)) {
          setShowFilterPanel(false);
        }
      }
    };

    const handleScroll = () => {
      setShowFilterPanel(false);
      setShowSuggestions(false);
      setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigationItems = [
    { path: '/home', label: 'Home', icon: FiHome },
    { path: '/bookmarks', label: 'Bookmarks', icon: FiBookmark },
  ];

  const NavLink = ({ to, children, className = '', onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${path === to 
          ? 'text-white bg-zinc-800' 
          : 'text-gray-300 hover:text-white hover:bg-zinc-800/50'
        }
        ${className}
      `}
    >
      {children}
      {path === to && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-zinc-800 rounded-lg -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchChange?.({ ...searchData, searchTerm: value });
    setShowSuggestions(true);
    setActiveSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchChange?.({ ...searchData, searchTerm: suggestion });
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionClick(searchSuggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
      default:
        break;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
      {/* Main Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link 
            to={currentUser ? '/home' : '/'} 
            className="flex items-center space-x-2 group flex-shrink-0"
          >
            <img 
              src="/img/logozk1.png" 
              alt="ZK Bug Directory" 
              className="w-10 h-10 object-contain transition-transform duration-200 group-hover:scale-105" 
            />
          </Link>

          {/* Search Bar and Filters - Only show when showSearch is true */}
          {currentUser && showSearch && (
            <div className="flex-1 max-w-7xl mx-4 flex items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative" ref={searchRef}>
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bug reports, protocols, severity..."
                  value={searchData.searchTerm || ''}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all duration-200 text-sm"
                />

                {/* Search Suggestions */}
                <AnimatePresence>
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
                    >
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                            index === activeSuggestion ? 'bg-zinc-800' : ''
                          }`}
                        >
                          <FiSearch className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{suggestion}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter Controls - Show when showFilters is true */}
              {showFilters && (
                <>
                  {/* Desktop: Only Filters button and View Mode */}
                  <div className="hidden md:flex items-center gap-3">
                    {/* Filters Button */}
                    <button
                      data-filter-button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFilterPanel(!showFilterPanel);
                      }}
                      className={`relative p-2.5 border border-zinc-700 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
                        showFilterPanel 
                          ? 'bg-zinc-700 text-white' 
                          : 'bg-zinc-900 hover:bg-zinc-800'
                      }`}
                    >
                      <FiFilter className="w-4 h-4" />
                      {getActiveFiltersCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-zinc-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </button>

                    {/* View Mode Toggle */}
                    <div className="flex bg-zinc-900 border border-zinc-700 rounded-lg p-1 flex-shrink-0">
                      <button
                        onClick={() => onViewModeChange?.('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}
                        title="List View"
                      >
                        <FiList className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onViewModeChange?.('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}
                        title="Grid View"
                      >
                        <FiGrid className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Results Count */}
                    <div className="hidden xl:block text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                      {filterStats.totalPosts || 0} results
                    </div>
                  </div>

                  {/* Mobile: Just filter icon */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden relative px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    <FiFilter className="w-4 h-4" />
                    {getActiveFiltersCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-zinc-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Desktop Navigation */}
          {currentUser && (
            <nav className={`hidden lg:flex items-center space-x-1 ${showSearch ? 'flex-shrink-0' : ''}`}>
              {navigationItems.map(({ path: itemPath, icon: Icon }) => (
                <NavLink key={itemPath} to={itemPath}>
                  <Icon className="w-5 h-5" />
                </NavLink>
              ))}
            </nav>
          )}

          {/* Desktop Actions */}
          <div className={`hidden md:flex items-center space-x-4 ${showSearch ? 'flex-shrink-0' : ''}`}>
            {currentUser ? (
              <>
                {/* Create Post Button */}
                <Link to="/create-post">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-2.5 bg-zinc-100 hover:bg-white text-black font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <FiPlus className="w-5 h-5" />
                  </motion.button>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors duration-200"
                  >
                    <img
                      src={currentUser.profilePicture}
                      alt={currentUser.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-zinc-700"
                    />
                    <span className="hidden lg:block text-sm text-gray-300">
                      {currentUser.username}
                    </span>
                    <FiChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-zinc-700">
                          <p className="text-sm font-medium text-white">{currentUser.username}</p>
                          <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/dashboard?tab=profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiUser className="w-4 h-4 mr-3" />
                            Profile Settings
                          </Link>

                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiSettings className="w-4 h-4 mr-3" />
                            Dashboard
                          </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-zinc-700 pt-2">
                          <button
                            onClick={() => {
                              handleSignout();
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
                          >
                            <FiLogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Guest Actions */
              <div className="flex items-center space-x-3">
                <Link
                  to="/sign-in"
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/sign-up">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-zinc-100 hover:bg-white text-black font-medium rounded-lg transition-all duration-200 text-sm"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Filter Panel - Only shows when "Filters" is clicked */}
      <AnimatePresence>
        {currentUser && showFilters && showFilterPanel && (
          <motion.div
            ref={filterPanelRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 z-40"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Protocol</label>
                    <select
                      id="protocol"
                      value={searchData.protocol || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    >
                      <option value="">All Protocols</option>
                      {filterStats.protocols?.map(protocol => (
                        <option key={protocol} value={protocol}>{protocol}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                    <select
                      id="severity"
                      value={searchData.severity || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    >
                      <option value="">All Severity</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="informational">Informational</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort</label>
                    <select
                      id="sort"
                      value={searchData.sort || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    >
                      <option value="">Default</option>
                      <option value="desc">Latest</option>
                      <option value="asc">Oldest</option>
                      <option value="severity">By Severity</option>
                    </select>
                  </div>

                  {/* Second Row - Additional Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Protocol Type</label>
                    <select
                      id="protocolType"
                      value={searchData.protocolType || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    >
                      <option value="">All Types</option>
                      <option value="ZKEVM">ZKEVM</option>
                      <option value="ZKTRIE">ZKTRIE</option>
                      <option value="L2GETH">L2GETH</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      id="difficulty"
                      value={searchData.difficulty || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    >
                      <option value="">All Difficulties</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      placeholder="Comma-separated tags"
                      value={searchData.tags || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      {filterStats.totalPosts || 0} results found
                    </span>
                    {getActiveFiltersCount() > 0 && (
                      <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                        {getActiveFiltersCount()} active filters
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={shareFilters}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-700 flex items-center gap-2"
                    >
                      {showShareSuccess ? (
                        <>
                          <FiCheck className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiShare2 className="w-4 h-4" />
                          Share Filters
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-700"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded-lg transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-zinc-800 bg-black/98 backdrop-blur-sm"
          >
            <div className="w-full px-4 py-4 space-y-4">
              {currentUser ? (
                <>
                  {/* Mobile Search - Only show when showSearch is true */}
                  {showSearch && (
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchData.searchTerm || ''}
                        onChange={handleSearchChange}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                      />
                    </div>
                  )}

                  {/* Mobile Filters - Only show when showFilters is true */}
                  {showFilters && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <FiFilter className="w-4 h-4" />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                          <span className="bg-zinc-600 text-white text-xs rounded-full px-2 py-0.5">
                            {getActiveFiltersCount()}
                          </span>
                        )}
                      </div>
                      
                      {/* Mobile Filter Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Protocol Filter */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Protocol</label>
                          <select
                            id="protocol"
                            value={searchData.protocol || ''}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600"
                          >
                            <option value="">All</option>
                            {filterStats.protocols?.map(protocol => (
                              <option key={protocol} value={protocol}>{protocol}</option>
                            ))}
                          </select>
                        </div>

                        {/* Severity Filter */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Severity</label>
                          <select
                            id="severity"
                            value={searchData.severity || ''}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600"
                          >
                            <option value="">All</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="informational">Info</option>
                          </select>
                        </div>

                        {/* Sort Filter */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Sort</label>
                          <select
                            id="sort"
                            value={searchData.sort || ''}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600"
                          >
                            <option value="">Default</option>
                            <option value="desc">Latest</option>
                            <option value="asc">Oldest</option>
                            <option value="severity">Severity</option>
                          </select>
                        </div>

                        {/* View Mode */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">View</label>
                          <div className="flex bg-zinc-900 border border-zinc-700 rounded-lg p-1">
                            <button
                              onClick={() => onViewModeChange?.('list')}
                              className={`flex-1 p-1.5 rounded text-xs ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-gray-400'}`}
                            >
                              List
                            </button>
                            <button
                              onClick={() => onViewModeChange?.('grid')}
                              className={`flex-1 p-1.5 rounded text-xs ${viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-gray-400'}`}
                            >
                              Grid
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Mobile Filters */}
                      <div className="space-y-3">
                        {/* Protocol Type */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Protocol Type</label>
                          <select
                            id="protocolType"
                            value={searchData.protocolType || ''}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600"
                          >
                            <option value="">All Types</option>
                            <option value="ZKEVM">ZKEVM</option>
                            <option value="ZKTRIE">ZKTRIE</option>
                            <option value="L2GETH">L2GETH</option>
                            <option value="OTHER">OTHER</option>
                          </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                          <select
                            id="difficulty"
                            value={searchData.difficulty || ''}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600"
                          >
                            <option value="">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Tags</label>
                          <input
                            type="text"
                            id="tags"
                            placeholder="Comma-separated tags"
                            value={searchData.tags || ''}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600"
                          />
                        </div>
                      </div>

                      {/* Mobile Action Buttons */}
                      <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                        <span className="text-xs text-gray-400">
                          {filterStats.totalPosts || 0} results
                        </span>
                        <div className="flex gap-2">
                          {getActiveFiltersCount() > 0 && (
                            <button
                              onClick={clearFilters}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-xs bg-zinc-600 hover:bg-zinc-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navigationItems.map(({ path: itemPath, label, icon: Icon }) => (
                      <Link
                        key={itemPath}
                        to={itemPath}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          path === itemPath
                            ? 'text-white bg-zinc-800'
                            : 'text-gray-300 hover:text-white hover:bg-zinc-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Actions */}
                  <div className="border-t border-zinc-800 pt-4 space-y-2">
                    <Link
                      to="/create-post"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 bg-zinc-100 text-black rounded-lg font-medium"
                    >
                      <FiPlus className="w-5 h-5" />
                      <span>New Post</span>
                    </Link>

                    <Link
                      to="/dashboard?tab=profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-zinc-800/50 rounded-lg"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        handleSignout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800/50 rounded-lg"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Mobile Guest Actions */
                <div className="space-y-2">
                  <Link
                    to="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-zinc-800/50 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-zinc-100 text-black rounded-lg font-medium text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}