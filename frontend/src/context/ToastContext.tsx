import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string };

const ToastContext = createContext<{ show: (msg: string, type?: Toast['type']) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: Toast['type']='info') => {
    setToasts((curr) => [...curr, { id: Date.now()+Math.random(), type, message }]);
  }, []);
  
  // Escuchar eventos globales de errores del interceptor de Axios
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: Toast['type'] }>;
      show(customEvent.detail.message, customEvent.detail.type);
    };
    
    window.addEventListener('show-toast', handleToastEvent);
    return () => window.removeEventListener('show-toast', handleToastEvent);
  }, [show]);
  
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(t => setTimeout(() => setToasts(curr => curr.filter(x => x.id !== t.id)), 3200));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts]);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
