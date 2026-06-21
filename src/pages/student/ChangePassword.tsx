import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../../components/ui/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <ChangePasswordModal
      isOpen={true}
      onClose={() => navigate('/student/dashboard')}
      userEmail={user?.email || ''}
    />
  );
};

export default ChangePassword;
