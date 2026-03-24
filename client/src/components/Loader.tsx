import React from 'react';

interface LoaderProps {
  fullPage?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullPage = false, message = "Loading..." }) => {
  const containerStyle: React.CSSProperties = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(12px)',
    zIndex: 9999,
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    minHeight: '200px',
  };

  return (
    <div style={containerStyle}>
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <div className="loader-pulse"></div>
      </div>
      {message && (
        <div style={{ 
          marginTop: '1.5rem', 
          color: 'var(--text-primary)', 
          fontWeight: 600, 
          letterSpacing: '0.05em',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {message}
        </div>
      )}
      <style>{`
        .loader-container {
          position: relative;
          width: 64px;
          height: 64px;
        }
        .loader-spinner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-primary);
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .loader-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 32px;
          height: 32px;
          background-color: var(--color-primary);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.5;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
