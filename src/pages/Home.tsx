import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Heart, Users, TrendingUp, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Fund } from '../types/index';
import FundCard from '../components/FundCard';
import { CompletedFunds } from '../components/CompletedFunds';

const categories = [
  { id: 'all', name: 'Все категории', icon: Heart },
  { id: 'education', name: 'Образование', icon: Users },
  { id: 'health', name: 'Здоровье', icon: Heart },
  { id: 'animals', name: 'Животные', icon: Heart },
  { id: 'environment', name: 'Экология', icon: TrendingUp },
  { id: 'other', name: 'Другое', icon: Heart }
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, username } = useAuth();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [featuredFunds, setFeaturedFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const response = await api.get('/api/funds');
        const allFunds = response.data;
        
       
        const activeFunds = allFunds.filter((fund: Fund) => fund.status === 'ACTIVE');
     
        const shuffled = [...activeFunds].sort(() => Math.random() - 0.5);
        
        setFeaturedFunds(shuffled.slice(0, 5));
        
        setFunds(allFunds);
        setLoading(false);
      } catch (err: any) {
        setError('Не удалось загрузить фонды. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchFunds();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('featured-funds-container');
    if (container) {
      const scrollAmount = 400; // Примерная ширина двух карточек
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fund.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || fund.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeFunds = filteredFunds.filter(fund => fund.status === 'ACTIVE');
  const completedFunds = filteredFunds.filter(fund => fund.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-light tracking-widest uppercase">Загрузка</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Приветственный блок */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">
            Быть добру
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Платформа для создания и поддержки благотворительных фондов. 
            Здесь каждый может помочь тем, кто в этом нуждается, или создать свой фонд для помощи другим.
          </p>
          {!isAuthenticated && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Присоединиться
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors duration-200"
              >
                Войти
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Heart size={24} className="text-green-600" />
            <h3 className="text-lg font-light">Активных фондов</h3>
          </div>
          <div className="text-2xl font-medium">{activeFunds.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={24} className="text-blue-600" />
            <h3 className="text-lg font-light">Завершенных фондов</h3>
          </div>
          <div className="text-2xl font-medium">{completedFunds.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Users size={24} className="text-purple-600" />
            <h3 className="text-lg font-light">Всего фондов</h3>
          </div>
          <div className="text-2xl font-medium">{funds.length}</div>
        </div>
      </div>

      {/* Featured Funds Section */}
      {featuredFunds.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Рекомендуемые фонды</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Прокрутить влево"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Прокрутить вправо"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          <div 
            id="featured-funds-container"
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredFunds.map((fund) => (
              <div key={fund.id} className="flex-none w-[350px]">
                <FundCard
                  fund={fund}
                  onDelete={() => {
                    if (isAuthenticated && (role === 'ADMIN' || (role === 'OWNER' && fund.username === username))) {
                      setFunds(prev => prev.filter(f => f.id !== fund.id));
                      setFeaturedFunds(prev => prev.filter(f => f.id !== fund.id));
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Funds Section */}
      <CompletedFunds />

      {/* Управление и поиск */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-light tracking-tight">Фонды</h2>
        {isAuthenticated && (role === 'ADMIN' || role === 'OWNER') && (
          <button
            onClick={() => navigate('/create-fund')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Создать фонд</span>
          </button>
        )}
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск фондов..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black appearance-none min-w-[200px]"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ArrowUpRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Список фондов */}
      {filteredFunds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Фонды не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map(fund => (
            <FundCard
              key={fund.id}
              fund={fund}
              onDelete={() => {
                if (isAuthenticated && (role === 'ADMIN' || (role === 'OWNER' && fund.username === username))) {
                  setFunds(prev => prev.filter(f => f.id !== fund.id));
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Призыв к действию для неавторизованных пользователей */}
      {!isAuthenticated && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-light mb-4">Хотите помочь?</h3>
          <p className="text-gray-600 mb-6">
            Зарегистрируйтесь, чтобы получить возможность делать пожертвования и следить за их статусом
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Зарегистрироваться
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;

// Добавляем стили для скрытия скроллбара
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Добавляем стили в head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);