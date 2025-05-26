import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle, XCircle, Clock, Calendar, Mail, MessageSquare, MapPin, User } from 'lucide-react';
import api from '../api/axios';
import { VolunteerRequestResponse } from '../types/index';

const FundVolunteerRequests = () => {
  const { fundId } = useParams<{ fundId: string }>();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VolunteerRequestResponse[]>([]);
  const [fund, setFund] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundResponse, requestsResponse] = await Promise.all([
          api.get(`/api/funds/${fundId}`),
          api.get(`/api/volunteers/fund/${fundId}`)
        ]);
        setFund(fundResponse.data);
        setRequests(requestsResponse.data);
        setLoading(false);
      } catch (err: any) {
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchData();
  }, [fundId]);

  const handleStatusUpdate = async (requestId: number, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      const response = await api.patch(`/api/volunteers/${requestId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setRequests(prev => prev.map(request => 
          request.id === requestId ? response.data : request
        ));
      }
    } catch (err: any) {
      console.error('Ошибка при обновлении статуса:', err);
      setError(err.response?.data?.message || 'Не удалось обновить статус заявки. Пожалуйста, попробуйте позже.');
    }
  };

  const handleBack = () => {
    navigate(`/funds/${fundId}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          <span>Назад к фонду</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Building2 size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{fund?.title}</h1>
                <p className="text-gray-500">{fund?.description}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-medium mb-6">Заявки волонтеров</h2>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-500">Пока нет заявок от волонтеров</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`px-6 py-4 ${
                  request.status === 'ACCEPTED' ? 'bg-green-50 border-b border-green-100' :
                  request.status === 'REJECTED' ? 'bg-red-50 border-b border-red-100' :
                  'bg-yellow-50 border-b border-yellow-100'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {request.status === 'ACCEPTED' && (
                        <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                          <CheckCircle size={18} />
                          <span>Одобрено</span>
                        </span>
                      )}
                      {request.status === 'REJECTED' && (
                        <span className="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                          <XCircle size={18} />
                          <span>Отклонено</span>
                        </span>
                      )}
                      {request.status === 'PENDING' && (
                        <span className="flex items-center gap-1 text-yellow-600 font-medium bg-yellow-50 px-3 py-1 rounded-full">
                          <Clock size={18} />
                          <span>На рассмотрении</span>
                        </span>
                      )}
                    </div>
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                          className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
                        >
                          Принять
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Calendar size={18} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата подачи</p>
                        <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="p-2 rounded-full bg-gray-100">
                        <User size={18} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Волонтер</p>
                        <p className="font-medium">{request.volunteerName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Mail size={18} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{request.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="p-2 rounded-full bg-gray-100">
                        <MessageSquare size={18} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telegram</p>
                        <p className="font-medium">{request.telegram}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="p-2 rounded-full bg-gray-100">
                        <MapPin size={18} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Город</p>
                        <p className="font-medium">{request.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Сообщение волонтера</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-600 leading-relaxed">{request.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundVolunteerRequests; 