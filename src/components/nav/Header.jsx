import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowDropdown } from "react-icons/io";
import { FaCog, FaKey, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isOpen, setOpen] = useState(true);
  const [isPredictionsOpen, setIsPredictionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const closeMenu = () => setOpen(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('first_name'));
  const [profile, setProfile] = useState(localStorage.getItem('profile_pic'));
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [isExpanded, setIsExpanded] = useState(false);
  const [userLands, setUserLands] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setUsername(localStorage.getItem('first_name'));
    setProfile(localStorage.getItem('profile_pic'));
    setEmail(localStorage.getItem('email'));
    
    // Fetch user lands from API
    const fetchUserLands = async () => {
      if (token) {
        try {
          const userId = localStorage.getItem("userid");
          const response = await axios.get(`${import.meta.env.VITE_API_BASE}/landmarks/${userId}/`, {
            headers: {
              Authorization: `Bearer ${JSON.parse(token)}`,
            },
          });
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            setUserLands(response.data);
          } else {
            setUserLands([]);
          }
        } catch (error) {
          console.error("Error fetching user lands:", error);
          setUserLands([]);
        }
      } else {
        setUserLands([]);
      }
    };

    fetchUserLands();
  }, [location]);

  const hasLands = userLands && userLands.length > 0;

  const handlePredictionClick = (path) => {
    if (!hasLands) {
      navigate('/LSM', { state: { message: 'Please register a farm land first before making predictions' } });
    } else {
      navigate(path);
    }
  };

  const toggleSlide = () => {
    setIsExpanded(!isExpanded);
  };

  const togglePredictions = () => {
    setIsPredictionsOpen(!isPredictionsOpen);
  };

  const handlePredictionsMouseEnter = () => {
    if (window.innerWidth > 1090) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      setIsPredictionsOpen(true);
    }
  };

  const handlePredictionsMouseLeave = () => {
    if (window.innerWidth > 1090) {
      const timeout = setTimeout(() => {
        setIsPredictionsOpen(false);
      }, 200);
      setHoverTimeout(timeout);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    closeMenu();
    if (isAuthenticated) {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE}/api/v1/auth/changePassword/`, { 'email': email });
        if (res.status === 200) {
          const response = res.data;
          const uid = response['uidb64'];
          const token = response['token'];
          navigate("/user/changepassword/", {
              state: {
                uid,
                token,
              },
            });
        }
      } catch (error) {
        console.error('Error changing password:', error);
      }
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.profile-cont')) {
        setOpen(true);
      }
    };

    if (!isOpen) {
      window.addEventListener('click', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen]);


  const handleLogout = () => {
    localStorage.clear();
    setUsername("");
    setProfile("");
    setEmail("");
    setIsAuthenticated(false);
  };

  return (
    <>
      <div className='fixed top-0 left-0 right-0 z-50'>
        <div className='bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-xl'>
          <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
            {/* Logo Section */}
            <Link to='/' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
              <div className='p-2 bg-white rounded-lg shadow-md'>
                <img src='https://cdn-icons-png.flaticon.com/128/15730/15730298.png' alt='Logo' className='w-6 h-6' />
              </div>
              <span className='text-2xl font-bold text-white hidden sm:inline'>AgroHarvest</span>
            </Link>

            {/* Desktop Navigation */}
            {username && (
              <nav className='hidden lg:flex items-center gap-1 font-medium'>
                <Link to='/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={toggleSlide}>
                  Home
                </Link>
                <Link to='LSM/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={toggleSlide}>
                  Manage Land
                </Link>
                
                {/* Predictions Dropdown */}
                <div 
                  className='relative group'
                  onMouseEnter={handlePredictionsMouseEnter}
                  onMouseLeave={handlePredictionsMouseLeave}
                >
                  <button className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all flex items-center gap-1'>
                    Make Predictions
                    <IoMdArrowDropdown className={`transform transition-transform ${isPredictionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isPredictionsOpen && (
                    <div className='absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl z-50 overflow-hidden min-w-max'>
                      <button 
                        onClick={() => handlePredictionClick('crs/')} 
                        disabled={!hasLands}
                        className={`block w-full text-left px-6 py-3 transition-colors border-b ${hasLands ? 'text-gray-800 hover:bg-emerald-50 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                        title={!hasLands ? 'Please register a farm land first' : ''}
                      >
                        🌾 Crop Recommendation
                      </button>
                      <button 
                        onClick={() => handlePredictionClick('cys/')} 
                        disabled={!hasLands}
                        className={`block w-full text-left px-6 py-3 transition-colors border-b ${hasLands ? 'text-gray-800 hover:bg-emerald-50 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                        title={!hasLands ? 'Please register a farm land first' : ''}
                      >
                        📊 Crop Yield Prediction
                      </button>
                      <button 
                        onClick={() => handlePredictionClick('fertilizer/')} 
                        disabled={!hasLands}
                        className={`block w-full text-left px-6 py-3 transition-colors ${hasLands ? 'text-gray-800 hover:bg-emerald-50 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                        title={!hasLands ? 'Please register a farm land first' : ''}
                      >
                        🌱 Fertilizer Recommendation
                      </button>
                    </div>
                  )}
                </div>

                <Link to='mylands/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={toggleSlide}>
                  My Farms
                </Link>
                <Link to='irrigation/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={toggleSlide}>
                  Irrigation
                </Link>
              </nav>
            )}

            {/* Right Section - Profile & Auth */}
            <div className='flex items-center gap-4'>
              {!isAuthenticated ? (
                <button 
                  onClick={() => navigate('/', { state: { showLoginModal: true, timestamp: Date.now() }, replace: true })} 
                  className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
                >
                  Sign in
                </button>
              ) : (
                <div className='profile-cont relative'>
                  <button
                    onClick={() => setOpen((prev) => !prev)}
                    className='flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-all'
                  >
                    <img src={profile || 'https://cdn-icons-png.flaticon.com/128/149/149071.png'} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                    <span className='text-white font-semibold hidden sm:inline text-sm'>{username}</span>
                  </button>

                  {/* Profile Dropdown */}
                  {!isOpen && (
                    <div className='absolute right-0 top-11 mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2'>
                      {/* User Info Card */}
                      <div className='bg-gradient-to-r from-emerald-50 to-teal-50 p-4 flex items-center gap-4 border-b border-gray-200'>
                        <img src={profile || 'https://cdn-icons-png.flaticon.com/128/149/149071.png'} alt="Profile" className="w-16 h-16 rounded-full object-cover border-3 border-emerald-500" />
                        <div className='flex-1'>
                          <p className='font-bold text-gray-800 text-lg'>{username}</p>
                          <p className='text-gray-600 text-sm truncate'>{email}</p>
                        </div>
                      </div>

                      {/* Options */}
                      <div className='py-2'>
                        <Link to='/user/settings' onClick={closeMenu} className='flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-emerald-50 transition-colors border-b border-gray-100'>
                          <FaCog className='text-emerald-500 text-lg' />
                          <span className='font-medium'>Manage Account</span>
                        </Link>
                        <button onClick={handleSubmit} className='w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-emerald-50 transition-colors border-b border-gray-100'>
                          <FaKey className='text-blue-500 text-lg' />
                          <span className='font-medium'>Change Password</span>
                        </button>
                        <Link to="/" onClick={handleLogout} className='flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-red-50 transition-colors'>
                          <FaSignOutAlt className='text-red-500 text-lg' />
                          <span className='font-medium'>Logout</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              {username && (
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className='lg:hidden text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all'
                >
                  {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {username && isMobileMenuOpen && (
            <div className='lg:hidden bg-white bg-opacity-10 backdrop-blur-sm border-t border-white border-opacity-20'>
              <nav className='flex flex-col gap-1 p-4'>
                <Link to='/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={() => { setIsMobileMenuOpen(false); toggleSlide(); }}>
                  Home
                </Link>
                <Link to='LSM/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={() => { setIsMobileMenuOpen(false); toggleSlide(); }}>
                  Register Land
                </Link>
                
                <button onClick={togglePredictions} className='text-left text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all flex items-center justify-between'>
                  Predictions
                  <IoMdArrowDropdown className={`transform transition-transform ${isPredictionsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isPredictionsOpen && (
                  <div className='bg-white bg-opacity-10 rounded-lg ml-4 mt-1 overflow-hidden'>
                    <button 
                      onClick={() => handlePredictionClick('crs/')} 
                      disabled={!hasLands}
                      className={`block w-full text-left px-4 py-2 transition-all ${hasLands ? 'text-white hover:bg-white hover:bg-opacity-20 cursor-pointer' : 'text-gray-300 cursor-not-allowed opacity-50'}`}
                      title={!hasLands ? 'Please register a farm land first' : ''}
                    >
                      🌾 Crop Recommendation
                    </button>
                    <button 
                      onClick={() => handlePredictionClick('cys/')} 
                      disabled={!hasLands}
                      className={`block w-full text-left px-4 py-2 transition-all ${hasLands ? 'text-white hover:bg-white hover:bg-opacity-20 cursor-pointer' : 'text-gray-300 cursor-not-allowed opacity-50'}`}
                      title={!hasLands ? 'Please register a farm land first' : ''}
                    >
                      📊 Crop Yield Prediction
                    </button>
                    <button 
                      onClick={() => handlePredictionClick('fertilizer/')} 
                      disabled={!hasLands}
                      className={`block w-full text-left px-4 py-2 transition-all ${hasLands ? 'text-white hover:bg-white hover:bg-opacity-20 cursor-pointer' : 'text-gray-300 cursor-not-allowed opacity-50'}`}
                      title={!hasLands ? 'Please register a farm land first' : ''}
                    >
                      🌱 Fertilizer Recommendation
                    </button>
                  </div>
                )}

                <Link to='mylands/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={() => { setIsMobileMenuOpen(false); toggleSlide(); }}>
                  My Lands
                </Link>
                <Link to='irrigation/' className='text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all' onClick={() => { setIsMobileMenuOpen(false); toggleSlide(); }}>
                  Irrigation
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
      
      {/* Body Content */}
      <div className='pt-20 w-full'>
        <Outlet />
      </div>
    </>
  );
};

export default Header;
