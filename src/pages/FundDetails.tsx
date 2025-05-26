import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Archive, CheckCircle, Activity, ArrowLeft, Trash2, ArrowUpRight, FileText } from 'lucide-react';
import api from '../api/axios';
import { Fund, FundStatus } from '../types/index';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import VolunteerApplicationButton from '../components/VolunteerApplicationButton';
import ViewVolunteerRequestsButton from '../components/ViewVolunteerRequestsButton';
import DonateButton from '../components/DonateButton';
import { FundReports } from '../components/FundReports';
import { CreateFundReport } from '../components/CreateFundReport';

const FundDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, username, role } = useAuth();
  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);

  useEffect(() => {
    const fetchFund = async () => {
      try {
        const response = await api.get(`/api/funds/${id}`);
        setFund(response.data);
        
        const imageResponse = await api.get(`/api/funds/${id}/image`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(imageResponse.data);
        setImageUrl(url);
        
        setLoading(false);
      } catch (err: any) {
        setError('Не удалось загрузить информацию о фонде. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchFund();
  }, [id]);

  const handleDeleteClick = () => {
    if (!isAuthenticated || (role !== 'ADMIN' && (role !== 'OWNER' || fund?.username !== username))) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!fund) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/api/funds/${fund.id}`);
      navigate('/');
    } catch (err: any) {
      setError('Не удалось удалить фонд. Пожалуйста, попробуйте позже.');
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
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

  const getStatusIcon = (status: FundStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Activity size={16} color={"green"} />;
      case 'COMPLETED':
        return <CheckCircle size={16} color={"blue"}/>;
      case 'ARCHIVED':
        return <Archive size={16} />;
    }
  };

  const statusStyles: Record<FundStatus, { text: string; bg: string }> = {
    ACTIVE: {
      text: 'text-green-600',
      bg:   'bg-green-100',
    },
    COMPLETED: {
      text: 'text-blue-600',
      bg:   'bg-blue-100',
    },
    ARCHIVED: {
      text: 'text-gray-500',
      bg:   'bg-gray-100',
    },
  };

  const getStatusColor = (status: FundStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-50';
      case 'ARCHIVED':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: FundStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'Активен';
      case 'COMPLETED':
        return 'Завершен';
      case 'ARCHIVED':
        return 'В архиве';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const progress = (fund.currentAmount / fund.targetAmount) * 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          <span>Назад</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={fund.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Нет изображения</span>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(fund.status)}`}>
                {getStatusText(fund.status)}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-light tracking-tight mb-2">{fund.title}</h1>
              <p className="text-gray-600">{fund.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Собрано</span>
                <span className="font-medium">{formatAmount(fund.currentAmount)} ₽</span>
              </div>
              <div className="h-2 bg-green-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 bg-opacity-20 transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Цель</span>
                <span className="font-medium">{formatAmount(fund.targetAmount)} ₽</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span>Дата окончания: {formatDate(fund.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Activity size={16} />
                <span>Категория: {fund.category}</span>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button
                className="text-sm text-gray-400 hover:text-black transition-colors duration-200 flex items-center gap-1 group"
                onClick={() => navigate(`/organizer/${fund.username}`)}
              >
                <span>Организатор:</span>
                <span className="group-hover:underline">{fund.ownerUsername}</span>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {isAuthenticated ? (
                <>
                  <DonateButton fundId={fund.id} fundTitle={fund.title} />
                  <VolunteerApplicationButton fundId={fund.id} />
                  {(role === 'ADMIN' || (role === 'OWNER' && fund.username === username)) && (
                    <>
                      <ViewVolunteerRequestsButton fundId={fund.id} fund={fund} />
                      {fund.status === 'COMPLETED' && (
                        <button
                          onClick={() => setShowCreateReport(true)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <FileText size={18} />
                          <span>Создать отчет</span>
                        </button>
                      )}
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 size={18} />
                        <span>Удалить фонд</span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Чтобы сделать пожертвование или стать волонтером, пожалуйста, войдите в систему
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-6 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors duration-200"
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Отчеты фонда */}
        <div className="mt-12">
          <h2 className="text-2xl font-light mb-6">Отчеты о работе фонда</h2>
          <FundReports fundId={fund.id} />
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Удаление фонда"
        message="Вы уверены, что хотите удалить этот фонд? Это действие нельзя отменить."
      />

      {showCreateReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateFundReport
              fundId={fund.id}
              onSuccess={() => {
                setShowCreateReport(false);
                // Можно добавить обновление списка отчетов
              }}
              onCancel={() => setShowCreateReport(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FundDetails; 