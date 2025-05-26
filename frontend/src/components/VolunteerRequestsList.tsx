import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Building2, Heart } from 'lucide-react';
import api from '../api/axios';
import { VolunteerRequestResponse } from '../types/index';

const VolunteerRequestsList = () => {
  const [requests, setRequests] = useState<VolunteerRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/api/volunteers/my-requests');
        setRequests(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Не удалось загрузить ваши заявки. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
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

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
        <Heart size={32} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">У вас пока нет заявок на волонтерство</p>
      </div>
    );
  }

  return (
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
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  request.status === 'ACCEPTED' ? 'bg-green-100' :
                  request.status === 'REJECTED' ? 'bg-red-100' :
                  'bg-yellow-100'
                }`}>
                  <Building2 size={20} className={
                    request.status === 'ACCEPTED' ? 'text-green-600' :
                    request.status === 'REJECTED' ? 'text-red-600' :
                    'text-yellow-600'
                  } />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{request.fundTitle}</h3>
                  <p className="text-sm text-gray-500">Название фонда</p>
                </div>
              </div>
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
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className={`p-2 rounded-full bg-gray-100`}>
                  <Calendar size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Дата подачи</p>
                  <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Ваше сообщение</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-600 leading-relaxed">{request.message}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VolunteerRequestsList; 