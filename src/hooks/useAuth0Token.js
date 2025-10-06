import { useAuth } from '../context/Auth0Context';

export function useAuth0Token() {
  const { getToken, isAuthenticated } = useAuth();

  const getAuthToken = async () => {
    if (!isAuthenticated) {
      return null;
    }
    
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting Auth0 token:', error);
      return null;
    }
  };

  return { getAuthToken };
}
