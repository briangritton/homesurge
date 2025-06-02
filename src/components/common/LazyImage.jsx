import { useState, useEffect, useRef } from 'react';

function LazyImage({ src, alt, className, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    // Fallback for browsers that don't support IntersectionObserver (mobile Safari issues)
    if (!window.IntersectionObserver) {
      console.warn('IntersectionObserver not supported, loading image immediately');
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image-container ${className || ''}`}
      style={{ minHeight: '100px', ...props.style }}
      {...props}
    >
      {!isInView && (
        <div 
          className="lazy-image-placeholder"
          style={{
            width: '100%',
            height: '100px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px'
          }}
        >
          Loading...
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={`lazy-image ${isLoaded ? 'lazy-image-loaded' : 'lazy-image-loading'}`}
          loading="lazy"
          style={{ width: '100%', height: 'auto' }}
        />
      )}
    </div>
  );
}

export default LazyImage;