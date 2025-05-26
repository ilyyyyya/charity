import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, UserCircle, Building2 } from 'lucide-react';
import api from '../api/axios';
import { Role } from '../types/index';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    role: 'DONOR' as Role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await api.post('/register', formData);
      setSuccess('Регистрация успешна! Теперь вы можете войти.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tight">Регистрация</h1>
          <p className="mt-2 text-sm text-gray-500">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-black hover:underline">
              Войти
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-600 rounded-lg text-sm">
              {success}
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
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Введите имя пользователя"
                />
              </div>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-light mb-2">
                Отображаемое имя
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Введите отображаемое имя или название организации"
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
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Введите пароль"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-light mb-2">
                Выберите вашу роль
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black appearance-none"
                >
                  <option value="DONOR">Донор</option>
                  <option value="VOLUNTEER">Волонтер</option>
                  <option value="OWNER">Владелец фонда</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Донор - может делать пожертвования в фонды<br />
                Волонтер - может помогать в организации фондов<br />
                Владелец фонда - может создавать и управлять фондами
              </p>
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
                <span>Регистрация...</span>
              </div>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;