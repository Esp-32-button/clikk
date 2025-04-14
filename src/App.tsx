import React, { useState, useEffect } from 'react';
import { Menu, X, Power } from 'lucide-react';
import Cookies from 'js-cookie';
import LoginForm from './components/LoginForm';
import ProductSection from './components/ProductSection';
import ControlPanel from './components/ControlPanel';



function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  
  useEffect(() => {
    const savedEmail = Cookies.get('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('https://pp-kcfa.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      Cookies.set('userEmail', email, { expires: 7 });
      
      setUserId(data.id || 'user-id');
      setUserEmail(email);
      setIsLoggedIn(true);
      setShowLoginForm(false);
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    Cookies.remove('userEmail');
    setIsLoggedIn(false);
    setUserId(null);
    setUserEmail(null);
  };

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Power className="h-8 w-8 text-blue-600" />
              <button
      onClick={() => navigate('/product-section')} // Direct navigation on click
      className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
    >
      ClikK
    </button>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => handleNavClick('features')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('specs')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Specifications
              </button>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                >
                  Login
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-2 pb-3 space-y-2">
              <button
                onClick={() => handleNavClick('features')}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('specs')}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
              >
                Specifications
              </button>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginForm(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20">
        {showLoginForm && !isLoggedIn ? (
          <LoginForm onLogin={handleLogin} onClose={() => setShowLoginForm(false)} />
        ) : isLoggedIn ? (
          <ControlPanel userId={userId!} userEmail={userEmail!} />
        ) : (
          <ProductSection />
        )}
      </main>
    </div>
  );
}

export default App;