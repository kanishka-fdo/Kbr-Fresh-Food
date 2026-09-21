import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * VideoModal — Universal fullscreen YouTube video modal.
 * Props:
 *   videoId  — YouTube video ID string (e.g. "dQw4w9WgXcQ")
 *   isOpen   — boolean
 *   onClose  — function
 *   title    — optional caption shown below video
 */
export default function VideoModal({ videoId, isOpen, onClose, title }) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  /* ESC key to close */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    /* Prevent body scroll when open */
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        animation: 'vmFadeIn 0.35s ease forwards',
      }}
      onClick={handleClose}
    >
      {/* Animated border frame */}
      <style>{`
        @keyframes vmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes vmSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .vm-frame {
          animation: vmSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-10 flex items-center justify-center transition-all"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,149,106,0.3)'; e.currentTarget.style.borderColor = '#b8956a'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        aria-label="Close video"
      >
        <X size={20} />
      </button>

      {/* Video container */}
      <div
        className="vm-frame relative w-full max-w-5xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Gold top border accent */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #b8956a, transparent)', marginBottom: 0 }} />

        {/* 16:9 iframe wrapper */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
            title={title || 'KBR Fresh Foods Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        </div>

        {/* Gold bottom border accent */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #b8956a, transparent)', marginTop: 0 }} />

        {/* Optional caption */}
        {title && (
          <p
            className="text-center mt-4"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '0.75rem',
              fontWeight: 400,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            {title}
          </p>
        )}
      </div>
    </div>
  );
}
