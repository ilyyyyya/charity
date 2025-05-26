import {Calendar, Archive, CheckCircle, ArrowUpRight, Activity, Trash2, Heart} from 'lucide-react';
import { Fund, FundStatus } from '../types/index';
import {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/axios.ts";
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from './ConfirmModal';
import VolunteerApplicationButton from './VolunteerApplicationButton';
import ViewVolunteerRequestsButton from './ViewVolunteerRequestsButton';
import DonateButton from './DonateButton';

interface FundCardProps {
  fund: Fund;
  onDelete: () => void;
}

const FundCard = ({ fund, onDelete }: FundCardProps) => {
  const { 
    id,
    title, 
    description, 
    currentAmount, 
    targetAmount,
    endDate,
    status,
    ownerUsername,
    category,
    username,
  } = fund;

  const navigate = useNavigate();
  const { isAuthenticated, username: authUsername, role } = useAuth();
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Получаем username организатора фонда
  const fundOwnerUsername = username;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await api.get(`/api/funds/${fund.id}/image`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setImgSrc(url);
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
        setImgSrc(null);
      } finally {
        setLoadingImg(false);
      }
    };

    fetchImage();
  }, [fund.id]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await api.delete(`/api/funds/delete/${fund.id}`);
      onDelete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось удалить фонд. Пожалуйста, попробуйте позже.');
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const handleClick = () => {
    navigate(`/funds/${fund.id}`);
  };

  const percentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  return (
    <>
      <div 
        onClick={handleClick}
        className="bg-white border border-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      >
        <div className="relative aspect-video">
      {loadingImg ? (
            <div className="w-full h-full bg-gray-200" />
      ) : imgSrc ? (
            <img
              src={imgSrc}
               alt={title}
              className="w-full h-full object-cover"
          />
      ) : (
          <div className="w-full h-48 bg-red-100 flex items-center justify-center">
            <span className="text-sm text-red-500">Изображение недоступно</span>
          </div>
      )}
          {isAuthenticated && (role === 'ADMIN' || (role === 'OWNER' && authUsername === fundOwnerUsername)) && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200"
            >
              <Trash2 size={18} className="text-red-500" />
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-light">{title}</h3>
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide
                ${statusStyles[status].text}
                ${statusStyles[status].bg}
              `}>
                {status === 'ACTIVE' ? 'Активен' :
                 status === 'COMPLETED' ? 'Завершен' : 'В архиве'}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>

          {/* Прогресс-бар */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Собрано</span>
              <span className="font-medium">{formatCurrency(currentAmount)}</span>
            </div>
            <div className="h-2 bg-green-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 bg-opacity-20 transition-all duration-500"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Цель</span>
              <span className="font-medium">{formatCurrency(targetAmount)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">{category}</span>
              <button
                className="text-xs text-gray-400 hover:text-black transition-colors duration-200 text-left flex items-center gap-1 group"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/organizer/${fundOwnerUsername}`);
                }}
              >
                <span>Организатор:</span>
                <span className="group-hover:underline">{ownerUsername}</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
            <div className="text-right">
              {/* <div className="text-sm font-light">{formatCurrency(currentAmount)}</div>
              <div className="text-xs text-gray-500">{formatCurrency(targetAmount)}</div> */}
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <VolunteerApplicationButton fundId={id} />
            <ViewVolunteerRequestsButton fundId={id} fund={fund} />
            <DonateButton fundId={id} fundTitle={title} />
          </div>
          {(role === 'ADMIN' || (role === 'OWNER' && authUsername === fundOwnerUsername)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/funds/${fund.id}/donations`);
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors"
            >
              <Heart size={18} />
              <span>Пожертвования</span>
            </button>
          )}
        </div>
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление фонда"
        message="Вы уверены, что хотите удалить этот фонд? Это действие нельзя будет отменить."
      />
    </>
  );
};

export default FundCard;