import { useEffect } from 'react';
import { useApp, useDispatch } from '../../context/AppContext';
import Icon from './Icon';

export default function Toast() {
  const { toast } = useApp();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <Icon name="check" size={16} />
      {toast}
    </div>
  );
}
