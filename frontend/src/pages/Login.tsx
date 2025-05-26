import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { decodeToken } from '../utils/jwt';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/login', { username, password });
      const token = response.data;
      
      const decodedToken = decodeToken(token);
      login(token, decodedToken.sub, decodedToken.displayName, decodedToken.role);
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tight">Вход</h1>
          <p className="mt-2 text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-black hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-light mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Введите имя пользователя"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-light mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Введите пароль"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Вход...</span>
              </div>
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;