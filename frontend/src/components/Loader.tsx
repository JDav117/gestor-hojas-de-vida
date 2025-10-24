import React from 'react';

export default function Loader() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        gap: 12,
        color: '#444',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif',
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 50 50"
        role="img"
        aria-label="Cargando"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="#888"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <span>Cargando…</span>
    </div>
  );
}
