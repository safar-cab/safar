import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showBack,
  showHome,
  onBack,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {showHome && (
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-lg bg-primary-50 hover:bg-primary-100 flex items-center justify-center transition-colors"
          >
            <Home className="w-5 h-5 text-primary-600" />
          </button>
        )}
        {showBack && !showHome && (
          <button
            onClick={onBack || (() => navigate(-1))}
            className="w-9 h-9 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
