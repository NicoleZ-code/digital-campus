import { useState, useEffect } from 'react';

export default function useNotice() {
  const [notice, notify] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => notify(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  return { notice, notify };
}
