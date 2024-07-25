import { useState } from 'react';

export function LoadingButton({ clickHandler, children }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={() => {
        setLoading(true);
        clickHandler().then(() => setLoading(false));
      }}
      disabled={loading}
    >
      {loading ? 'Loading' : children}
    </button>
  );
}
