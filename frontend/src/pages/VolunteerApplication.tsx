import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../api/axios';

interface VolunteerApplicationForm {
  email: string;
  telegram: string;
  city: string;
  message: string;
}

const VolunteerApplication = () => {
  const { fundId } = useParams<{ fundId: string }>();
  const navigate = useNavigate();
  const [fund, setFund] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [formData, setFormData] = useState<VolunteerApplicationForm>({
    email: '',
    telegram: '',
    city: '',
    message: ''
  });

  useEffect(() => {
    const fetchFundAndRequest = async () => {
      try {
        // Получаем информацию о фонде
        const fundResponse = await api.get(`/api/funds/${fundId}`);
        setFund(fundResponse.data);

        // Проверяем существующую заявку
        const requestsResponse = await api.get('/api/volunteers/my-requests');
        const existingRequest = requestsResponse.data.find(
          (request: any) => request.fundId === Number(fundId)
        );
        
        if (existingRequest) {
          setExistingRequest(existingRequest);
        }

        setLoading(false);
      } catch (err: any) {
        setError('Не удалось загрузить информацию о фонде. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchFundAndRequest();
  }, [fundId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (existingRequest?.status === 'PENDING') {
      setError('У вас уже есть активная заявка на рассмотрении. Пожалуйста, дождитесь решения по текущей заявке.');
      return;
    }

    try {
      await api.post(`/api/volunteers/create/${fundId}`, formData);
      navigate(`/funds/${fundId}`, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось отправить заявку. Пожалуйста, попробуйте позже.');
    }
  };

  const handleBack = () => {
    navigate(`/funds/${fundId}`, { replace: true });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          textColor: 'text-green-600',
          icon: <CheckCircle size={20} />,
          title: 'Ваша заявка одобрена!',
          message: 'Вы уже являетесь волонтером этого фонда.'
        };
      case 'REJECTED':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-600',
          icon: <XCircle size={20} />,
          title: 'Ваша заявка отклонена',
          message: 'К сожалению, ваша заявка не была одобрена.'
        };
      default:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-100',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-600',
          icon: <Clock size={20} />,
          title: 'Заявка на рассмотрении',
          message: 'Ваша заявка находится на рассмотрении. Пожалуйста, ожидайте решения.'
        };
    }
  };

  const statusInfo = existingRequest ? getStatusInfo(existingRequest.status) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          <span>Назад к фонду</span>
        </button>

        <h1 className="text-3xl font-light tracking-tight mb-8">Заявка на волонтерство</h1>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Building2 size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{fund?.title}</h2>
                <p className="text-gray-500">{fund?.description}</p>
              </div>
            </div>
          </div>

          {statusInfo && (
            <div className={`p-6 ${statusInfo.bgColor} border-b ${statusInfo.borderColor}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${statusInfo.iconBg}`}>
                  <div className={statusInfo.iconColor}>
                    {statusInfo.icon}
                  </div>
                </div>
                <div>
                  <h3 className={`font-medium mb-1 ${statusInfo.titleColor}`}>
                    {statusInfo.title}
                  </h3>
                  <p className={statusInfo.textColor}>
                    {statusInfo.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!existingRequest && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-light mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Введите ваш email"
                />
              </div>

              <div>
                <label htmlFor="telegram" className="block text-sm font-light mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  id="telegram"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="@username"
                />
                <p className="mt-1 text-xs text-gray-500">Введите ваш Telegram username в формате @username</p>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-light mb-2">
                  Город
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Введите ваш город"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-light mb-2">
                  Сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Расскажите о себе и почему вы хотите стать волонтером"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.message.length}/500 символов
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Отправить заявку
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerApplication; 