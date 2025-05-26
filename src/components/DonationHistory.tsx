import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Clock, ExternalLink } from 'lucide-react';

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

const DonationHistory = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await api.get('/api/v1/donations/my');
        const sortedDonations = [...response.data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setDonations(sortedDonations);
        setLoading(false);
      } catch (err: any) {
        setError('Не удалось загрузить историю пожертвований');
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

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
      case 'CANCELLED':
        return 'Отменено';
      case 'FAILED':
        return 'Ошибка оплаты';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        У вас пока нет пожертвований
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-light">История пожертвований</h2>
      <div className="space-y-4">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium">{donation.fundTitle}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>{formatDate(donation.createdAt)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatAmount(donation.amount, donation.currency)}</div>
                <div className={`text-sm px-2 py-1 rounded-full ${getStatusColor(donation.status)}`}>
                  {getStatusText(donation.status)}
                </div>
              </div>
            </div>
            {donation.confirmationUrl && donation.status === 'PENDING' && (
              <div className="mt-3">
                <a
                  href={donation.confirmationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink size={16} />
                  Перейти к оплате
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationHistory; 