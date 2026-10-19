import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { confirmAction } from '../utils/confirmAction';
import { notify } from '../utils/notifications';

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return async () => {
    if (!await confirmAction({ title: 'Log out?', text: 'Are you sure you want to log out of your account?', confirmButtonText: 'Log out' })) return;
    try {
      await logout();
      notify.success('You have logged out successfully.');
      navigate('/login', { replace: true });
    } catch {
      notify.error('Could not log out. Please try again.');
    }
  };
}
