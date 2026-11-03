import { useState, useCallback } from 'react';

export default function useModelExport(notify) {
  const [busy, setBusy] = useState(false);
  const [request, setRequest] = useState(0);
  const complete = useCallback(
    (message) => {
      setBusy(false);
      notify(message);
    },
    [notify],
  );
  function start() {
    if (busy) return;
    setBusy(true);
    setRequest((value) => value + 1);
  }
  return { busy, request, start, complete };
}
