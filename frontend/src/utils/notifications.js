import toast from 'react-hot-toast';

export const notify = {
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
};

export const apiErrorMessage = (error, fallback) =>
  error.response?.data?.message || (error.request ? 'Unable to reach the server. Please try again.' : fallback);

// A 403 is already announced by the shared API interceptor.
export function notifyApiError(error, fallback) {
  const message = apiErrorMessage(error, fallback);
  if (error.response?.status !== 403) notify.error(message);
  return message;
}
