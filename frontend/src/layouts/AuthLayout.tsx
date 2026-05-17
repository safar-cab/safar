import { Outlet } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt={APP_NAME} className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
          <h1 className="text-2xl font-bold text-neutral-900">{APP_NAME}</h1>
          <p className="text-sm text-neutral-500 mt-1">Your journey, your way</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
