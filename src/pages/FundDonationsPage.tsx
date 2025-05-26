import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, Heart, TrendingUp, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

interface Donation {
  id: number;
  paymentId: string;
  confirmationUrl: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  currency: string;
  createdAt: string;
  fundTitle: string;
  donorName: string;
}

const FundDonationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, username } = useAuth();
  const [fund, setFund] = useState<{ title: string; username: string } | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем информацию о фонде
        const fundResponse = await api.get(`/api/funds/${id}`);
        setFund(fundResponse.data);

        // Получаем пожертвования
        const donationsResponse = await api.get(`/api/v1/donations/fund/${id}`);
        // Фильтруем только завершенные пожертвования и сортируем по дате
        const completedDonations = donationsResponse.data
          .filter((donation: Donation) => donation.status === 'COMPLETED')
          .sort((a: Donation, b: Donation) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setDonations(completedDonations);
        setLoading(false);
      } catch (err: any) {
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Выполнено';
      case 'PENDING':
        return 'В обработке';
      case 'FAILED':
        return 'Ошибка оплаты';
      default:
        return status;
    }
  };

  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const uniqueDonors = new Set(donations.map(d => d.donorName)).size;

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

  if (!fund) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>Фонд не найден</div>
      </div>
    );
  }

  // Проверяем права доступа
  if (role !== 'ADMIN' && (role !== 'OWNER' || fund.username !== username)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>У вас нет доступа к этой странице</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок и кнопка назад */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Назад</span>
            </button>
          </div>

          {/* Заголовок фонда */}
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">{fund.title}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <Heart size={16} />
              <span>История пожертвований</span>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-green-600" />
                <h3 className="text-lg font-light">Собрано средств</h3>
              </div>
              <div className="text-2xl font-medium">{formatAmount(totalAmount, 'RUB')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} className="text-blue-600" />
                <h3 className="text-lg font-light">Доноров</h3>
              </div>
              <div className="text-2xl font-medium">{uniqueDonors}</div>
            </div>
          </div>

          {/* Список пожертвований */}
          {donations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Heart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Пока нет завершенных пожертвований</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="font-medium text-lg">{donation.donorName}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>{formatDate(donation.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-medium mb-2">
                        {formatAmount(donation.amount, donation.currency)}
                      </div>
                      <div className="text-sm px-3 py-1 rounded-full text-green-600 bg-green-50">
                        Выполнено
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundDonationsPage; 