import { useLightbox } from '../../context/LightboxContext';

export default function ClickableImage({ src, alt = '', className = '', style = {}, onClick, title, ...props }) {
  const { openLightbox } = useLightbox();

  if (!src) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    openLightbox(src, alt);
    if (onClick) onClick(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      title={title || 'Click to enlarge'}
      onClick={handleClick}
      className={`cursor-zoom-in hover:opacity-90 transition-all duration-200 ${className}`}
      style={style}
      {...props}
    />
  );
}
