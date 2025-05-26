import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Plus, Activity, CheckCircle, Archive, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Fund } from '../types/index';
import FundCard from '../components/FundCard';
import VolunteerRequestsList from '../components/VolunteerRequestsList';
import DonationHistory from '../components/DonationHistory';

const Profile = () => {
  const navigate = useNavigate();
  const { displayName, role, username } = useAuth();
  const [myFunds, setMyFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyFunds = async () => {
    try {
      const response = await api.get('/api/funds/my-funds');
      setMyFunds(response.data);
      setLoading(false);
    } catch (err: any) {
      setError('Не удалось загрузить ваши фонды. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFunds();
  }, []);

  const handleDelete = () => {
    fetchMyFunds();
  };

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

  const activeFunds = myFunds.filter(fund => fund.status === 'ACTIVE').length;
  const completedFunds = myFunds.filter(fund => fund.status === 'COMPLETED').length;
  const archivedFunds = myFunds.filter(fund => fund.status === 'ARCHIVED').length;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Профиль пользователя */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <UserCircle size={32} className="text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-light tracking-tight">{displayName}</h1>
                <p className="text-gray-500">@{username}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {role === 'ADMIN' ? 'Администратор' :
                   role === 'OWNER' ? 'Владелец фонда' :
                   role === 'VOLUNTEER' ? 'Волонтер' : 'Донор'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-black transition-colors"
              >
                <Settings size={20} />
              </button>
              {(role === 'ADMIN' || role === 'OWNER') && (
                <button
                  onClick={() => navigate('/create-fund')}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus size={20} />
                  <span>Создать фонд</span>
                </button>
              )}
            </div>
          </div>

          {/* Статистика фондов */}
          {(role === 'ADMIN' || role === 'OWNER') && (
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1 text-green-600">
                <Activity size={16} />
                <span className="text-sm">{activeFunds} активных</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <CheckCircle size={16} />
                <span className="text-sm">{completedFunds} завершенных</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Archive size={16} />
                <span className="text-sm">{archivedFunds} в архиве</span>
              </div>
            </div>
          )}
        </div>

        {/* Заявки волонтера */}
        {role === 'VOLUNTEER' && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-light">Мои заявки на волонтерство</h2>
            <VolunteerRequestsList />
          </div>
        )}

        {/* История пожертвований */}
        {role === 'DONOR' && (
          <div className="mb-6">
            <DonationHistory />
          </div>
        )}

        {/* Мои фонды */}
        {(role === 'ADMIN' || role === 'OWNER') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-light">Мои фонды</h2>
              <div className="text-sm text-gray-500">
                Всего: {myFunds.length}
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {myFunds.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">У вас пока нет созданных фондов</p>
                <button
                  onClick={() => navigate('/create-fund')}
                  className="mt-4 text-black hover:underline"
                >
                  Создать первый фонд
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myFunds.map(fund => (
                  <FundCard
                    key={fund.id}
                    fund={fund}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 