import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../../components/ui/ChangePasswordModal';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ChangePasswordModal
      isOpen={true}
      onClose={() => navigate('/student/dashboard')}
    />
  );
};

export default ChangePassword;
