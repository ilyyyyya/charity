import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fund } from '../types/index';

interface ViewVolunteerRequestsButtonProps {
  fundId: number;
  fund: Fund;
  className?: string;
}

const ViewVolunteerRequestsButton = ({ fundId, fund, className = '' }: ViewVolunteerRequestsButtonProps) => {
  const navigate = useNavigate();
  const { role, username } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/funds/${fundId}/volunteer-requests`);
  };

  // Админ видит все кнопки, OWNER только свои фонды
  if (role !== 'ADMIN' && (role !== 'OWNER' || fund.username !== username)) {
    return null;
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
      >
        <Users size={18} />
        <span>Заявки волонтеров</span>
      </button>
    </div>
  );
};

export default ViewVolunteerRequestsButton; 