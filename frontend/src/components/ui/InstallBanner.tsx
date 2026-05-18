import { Download, X } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export function InstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-4 shadow-2xl flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
          <Download className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Install Safar</p>
          <p className="text-xs text-slate-400">Add to home screen for quick access</p>
        </div>
        <button
          onClick={install}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
