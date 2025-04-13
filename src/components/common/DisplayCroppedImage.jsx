import React, { useState, useEffect } from 'react';

const DisplayCroppedImage = ({ imageUrl, transformations, showOriginal = false }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVertical, setIsVertical] = useState(false);

  // Efecto para detectar orientación de la imagen
  useEffect(() => {
    if (!imageUrl) return;

    setLoading(true);
    setError(false);

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      // Detectar si la imagen es vertical
      setIsVertical(img.height > img.width);
      setLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setLoading(false);
      console.error('Error al cargar la imagen:', imageUrl);
    };
  }, [imageUrl]);

  if (error) {
    return (
      <div className="text-center p-5 bg-light rounded">
        <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
        <p className="mt-3">Imagen no disponible</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si tenemos transformaciones y no estamos mostrando la imagen original
  const hasTransformations = transformations && !showOriginal;

  // Estilo para la imagen según su orientación
  const imageStyle = {
    maxHeight: isVertical ? '80vh' : '65vh', // Altura más conservadora para imágenes verticales
    objectFit: 'contain',
    borderRadius: '4px',
  };

  // Agregar transformaciones CSS si es necesario
  if (hasTransformations) {
    const { rotation = 0, scale = 1, flipHorizontal = 1, flipVertical = 1 } = transformations;

    imageStyle.transform = `
      rotate(${rotation}deg) 
      scale(${scale * flipHorizontal}, ${scale * flipVertical})
    `;
    imageStyle.transformOrigin = 'center center';
  }

  return (
    <div className={`image-container ${isVertical ? 'vertical-container' : 'horizontal-container'}`}>
      <img
        src={imageUrl}
        alt="Imagen de detalle"
        className={isVertical ? 'vertical-image' : 'horizontal-image'}
        style={imageStyle}
      />

      <style jsx="true">{`
        .image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        
        .vertical-container {
          min-width: 300px;
        }
        
        .vertical-image {
          height: auto;
          max-height: 60vh; /* Más conservador para evitar cortes */
          width: auto;
        }
        
        .horizontal-image {
          width: 100%;
          height: auto;
          max-height: 65vh;
        }
      `}</style>
    </div>
  );
};

export default DisplayCroppedImage; 