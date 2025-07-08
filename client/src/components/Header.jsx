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
  FiGrid
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
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

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

  const clearFilters = () => {
    const clearedData = {
      searchTerm: '',
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
    return Object.values(searchData).filter(value => value && value !== '').length;
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
                  {/* Desktop: Full filter controls */}
                  <div className="hidden md:flex items-center gap-3">
                    {/* Protocol Filter */}
                    <select
                      id="protocol"
                      value={searchData.protocol || ''}
                      onChange={handleFilterChange}
                      className="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600 flex-shrink-0 min-w-[120px]"
                    >
                      <option value="">All Protocols</option>
                      {filterStats.protocols?.map(protocol => (
                        <option key={protocol} value={protocol}>{protocol}</option>
                      ))}
                    </select>

                    {/* Severity Filter */}
                    <select
                      id="severity"
                      value={searchData.severity || ''}
                      onChange={handleFilterChange}
                      className="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600 flex-shrink-0 min-w-[110px]"
                    >
                      <option value="">All Severity</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="informational">Info</option>
                    </select>

                    {/* Sort Filter */}
                    <select
                      id="sort"
                      value={searchData.sort || ''}
                      onChange={handleFilterChange}
                      className="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-zinc-600 flex-shrink-0 min-w-[100px]"
                    >
                      <option value="">Default</option>
                      <option value="desc">Latest</option>
                      <option value="asc">Oldest</option>
                      <option value="severity">Severity</option>
                    </select>

                    {/* More Filters Button */}
                    <button
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                      className="relative px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <FiFilter className="w-4 h-4" />
                      <span className="hidden lg:inline text-sm">More</span>
                      {getActiveFiltersCount() > 3 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          +
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
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
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
              {navigationItems.map(({ path: itemPath, label, icon: Icon }) => (
                <NavLink key={itemPath} to={itemPath}>
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
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
                    className="inline-flex items-center px-4 py-2 bg-zinc-100 hover:bg-white text-black font-medium rounded-lg transition-all duration-200 space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>New Post</span>
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
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
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

                      {/* Mobile Results Count and Clear Filters */}
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                        <span className="text-xs text-gray-400">
                          {filterStats.totalPosts || 0} results
                        </span>
                        {getActiveFiltersCount() > 0 && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Clear filters
                          </button>
                        )}
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

      {/* Additional Filters Panel - Only shows when "More" is clicked */}
      <AnimatePresence>
        {currentUser && showFilters && showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-b border-zinc-800"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Protocol Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Protocol Type</label>
                    <select
                      id="protocolType"
                      value={searchData.protocolType || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-600"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      id="difficulty"
                      value={searchData.difficulty || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-600"
                    >
                      <option value="">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      placeholder="Comma-separated tags"
                      value={searchData.tags || ''}
                      onChange={handleFilterChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-600"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {getActiveFiltersCount() > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear all filters
                    </button>
                    <span className="text-xs text-gray-500">
                      {getActiveFiltersCount()} active filters
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}