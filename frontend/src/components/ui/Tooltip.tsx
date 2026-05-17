import { useState, useRef, memo } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = memo(function Tooltip({
  content,
  children,
  position = 'top',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const rect = ref.current?.getBoundingClientRect();

  const getPosition = () => {
    if (!rect) return {};
    const gap = 8;
    switch (position) {
      case 'top':
        return {
          top: rect.top - gap,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + gap,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - gap,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + gap,
          transform: 'translate(0, -50%)',
        };
    }
  };

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="inline-flex"
      >
        {children}
      </div>
      {visible &&
        rect &&
        createPortal(
          <div
            style={{ position: 'fixed', zIndex: 9999, ...getPosition() }}
            className="px-2.5 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
});
