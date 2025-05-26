import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserCircle, Activity, CheckCircle, Archive } from 'lucide-react';
import api from '../api/axios';
import FundCard from '../components/FundCard';
import { Fund, OrganizerProfileResponse } from '../types/index';

const OrganizerProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<OrganizerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/organizers/${username}`);
        setProfile(response.data);
      } catch (err) {
        setError('Не удалось загрузить профиль организатора. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>Организатор не найден</div>
      </div>
    );
  }

  const activeFunds = profile.funds.filter(fund => fund.status === 'ACTIVE').length;
  const completedFunds = profile.funds.filter(fund => fund.status === 'COMPLETED').length;
  const archivedFunds = profile.funds.filter(fund => fund.status === 'ARCHIVED').length;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Профиль организатора */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <UserCircle size={32} className="text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight">
                {profile.displayName || profile.username}
              </h1>
              <p className="text-gray-500">@{profile.username}</p>
            </div>
          </div>

          {/* Статистика фондов */}
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
        </div>

        {/* Список фондов */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light">Фонды организатора</h2>
            <div className="text-sm text-gray-500">
              Всего: {profile.funds.length}
            </div>
          </div>
          
          {profile.funds.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">У организатора пока нет созданных фондов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.funds.map(fund => (
                <FundCard
                  key={fund.id}
                  fund={fund}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile; 