import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { X } from 'lucide-react';

interface DonationResponse {
  id: number;
  paymentId: string;
  confirmationUrl: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  fundTitle: string;
  donorName: string;
}

interface DonateButtonProps {
  fundId: number;
  fundTitle: string;
  className?: string;
}

const DonateButton = ({ fundId, fundTitle, className = '' }: DonateButtonProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState(2000);
  const [description, setDescription] = useState('');

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/funds/${fundId}` } });
      return;
    }

    if (role !== 'DONOR') {
      return;
    }

    setShowModal(true);
  };

  const handleDonate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post<DonationResponse>('/api/v1/donations', {
        fundId,
        amount,
        description: description || "Пожертвование",
        returnUrl: `${window.location.origin}/funds/${fundId}`
      });

      if (response.data.confirmationUrl) {
        window.location.href = response.data.confirmationUrl;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать пожертвование. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [1000, 2000, 5000, 10000];

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 ${className}`}
      >
        Войти для пожертвования
      </button>
    );
  }

  if (role !== 'DONOR') {
    return null;
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
      >
        <span>Пожертвовать</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light">Сделать пожертвование</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите сумму
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {suggestedAmounts.map((suggestedAmount) => (
                    <button
                      key={suggestedAmount}
                      onClick={() => setAmount(suggestedAmount)}
                      className={`px-4 py-2 rounded-lg border ${
                        amount === suggestedAmount
                          ? 'border-green-600 bg-green-50 text-green-600'
                          : 'border-green-200 hover:border-green-600 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {suggestedAmount.toLocaleString()} ₽
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="100"
                    step="100"
                    className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-green-50"
                    placeholder="Или введите другую сумму"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-green-50"
                  placeholder="Напишите, если хотите оставить комментарий"
                  rows={3}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-green-600"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDonate}
                  disabled={loading || amount < 100}
                  className="px-6 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Создание...</span>
                    </div>
                  ) : (
                    'Пожертвовать'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateButton; 