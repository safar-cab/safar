import { useContext } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store/store';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { InstallBanner } from '@/components/ui/InstallBanner';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from '@/router';

function NotificationInit() {
  const { user } = useContext(AuthContext);
  useNotifications(!!user);
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationInit />
        <OfflineBanner />
        <RouterProvider router={router} />
        <InstallBanner />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E11D48', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </Provider>
  );
}

export default App;
