import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface VolunteerApplicationButtonProps {
  fundId: number;
  className?: string;
}

const VolunteerApplicationButton = ({ fundId, className = '' }: VolunteerApplicationButtonProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/funds/${fundId}` } });
      return;
    }

    if (role !== 'VOLUNTEER') {
      // Можно добавить модальное окно с информацией о том, как стать волонтером
      return;
    }

    navigate(`/volunteer-application/${fundId}`);
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 ${className}`}
      >
        <Heart size={18} />
        <span>Войти для волонтерства</span>
      </button>
    );
  }

  if (role !== 'VOLUNTEER') {
    return null;
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
      >
        <Heart size={18} />
        <span>Стать волонтером</span>
      </button>
    </div>
  );
};

export default VolunteerApplicationButton; 