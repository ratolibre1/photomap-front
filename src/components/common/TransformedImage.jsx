import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const TransformedImage = ({
  imageUrl,
  transformations,
  alt,
  className = '',
  style = {},
  containerClassName = '',
  containerStyle = {},
  showEditedBadge = true
}) => {
  const { t } = useTranslation(['photos']);

  // Si no hay transformaciones o la imagen está en su estado original
  if (!transformations) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        style={style}
      />
    );
  }

  // Extraer transformaciones
  const { rotation = 0, scale = 1, flipHorizontal = 1, flipVertical = 1, crop } = transformations;

  // Calcular estilos CSS para las transformaciones
  const imgStyle = {
    ...style,
    transform: `
      rotate(${rotation}deg)
      scale(${scale * flipHorizontal}, ${scale * flipVertical})
    `,
    transformOrigin: 'center center'
  };

  // Si hay recorte, configurar el contenedor para aplicarlo
  if (crop && (crop.width < 100 || crop.height < 100 || crop.x !== 50 || crop.y !== 50)) {
    const cropContainerStyle = {
      ...containerStyle,
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '100%'
    };

    // Calcular posición de la imagen dentro del recorte
    const positionStyle = {
      position: 'absolute',
      objectPosition: `${crop.x}% ${crop.y}%`,
      width: `${100 * (100 / crop.width)}%`, // Invertir para hacer zoom
      height: `${100 * (100 / crop.height)}%`,
      left: `${50 - (crop.x * (100 / crop.width))}%`,
      top: `${50 - (crop.y * (100 / crop.height))}%`
    };

    return (
      <div className={`transformed-image-container ${containerClassName}`} style={cropContainerStyle}>
        <img
          src={imageUrl}
          alt={alt}
          className={`transformed-image ${className}`}
          style={{ ...imgStyle, ...positionStyle }}
        />
        {showEditedBadge && <div className="photo-edited-badge">
          <i className="bi bi-pencil-fill me-1" style={{ fontSize: '0.6rem' }}></i>
          {t('photos:image_editor.edited_badge')}
        </div>}
      </div>
    );
  }

  // Si no hay recorte, simplemente aplicar las transformaciones
  return (
    <div className={`transformed-image-container ${containerClassName}`} style={containerStyle}>
      <img
        src={imageUrl}
        alt={alt}
        className={`transformed-image ${className}`}
        style={imgStyle}
      />
      {showEditedBadge && <div className="photo-edited-badge">
        <i className="bi bi-pencil-fill me-1" style={{ fontSize: '0.6rem' }}></i>
        {t('photos:image_editor.edited_badge')}
      </div>}
    </div>
  );
};

TransformedImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  transformations: PropTypes.shape({
    rotation: PropTypes.number,
    scale: PropTypes.number,
    flipHorizontal: PropTypes.number,
    flipVertical: PropTypes.number,
    crop: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number
    })
  }),
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  containerClassName: PropTypes.string,
  containerStyle: PropTypes.object,
  showEditedBadge: PropTypes.bool
};

export default TransformedImage; 