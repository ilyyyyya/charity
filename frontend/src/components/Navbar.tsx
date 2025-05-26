import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, displayName } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl tracking-widest hover:tracking-wider transition-all duration-300">
            БЫТЬ ДОБРУ
          </Link>
          
          <div className="flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className="text-sm tracking-wide hover:tracking-wider transition-all duration-300"
                >
                  Фонды
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors duration-200"
                  >
                    <UserCircle size={18} />
                    <span>{displayName}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm group"
                  >
                    <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span className="tracking-wide group-hover:tracking-wider transition-all duration-300">
                        Выйти
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 text-sm group"
                >
                  <UserCircle size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="tracking-wide group-hover:tracking-wider transition-all duration-300">
                    Войти
                  </span>
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm tracking-wide hover:tracking-wider transition-all duration-300 border-b-2 border-black pb-1"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;