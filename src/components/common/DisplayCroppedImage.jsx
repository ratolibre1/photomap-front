import React, { useRef, useEffect, useState } from 'react';

const DisplayCroppedImage = ({ imageUrl, transformations, showOriginal = false }) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    // Limpiar cualquier imagen anterior
    setLoading(true);
    setError(false);
    setUseFallback(false);

    const img = new Image();
    img.src = imageUrl;
    imgRef.current = img;

    img.onload = () => {
      setLoading(false);
      try {
        // Intentamos dibujar en canvas
        drawImage();
      } catch (e) {
        // Si falla, usamos el fallback
        console.error('Error dibujando en canvas, usando fallback:', e);
        setUseFallback(true);
      }
    };

    img.onerror = () => {
      setLoading(false);
      setError(true);
      console.error('Error al cargar la imagen:', imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && !loading && !useFallback) {
      try {
        drawImage();
      } catch (e) {
        console.error('Error al actualizar el canvas, usando fallback:', e);
        setUseFallback(true);
      }
    }
  }, [showOriginal, transformations, loading]);

  const drawImage = () => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setUseFallback(true);
      return;
    }

    const img = imgRef.current;

    try {
      // Ajustar el canvas al tamaño de la imagen manteniendo la proporción
      const containerWidth = canvas.parentElement?.clientWidth || 300; // Valor por defecto si no hay padre
      const scale = containerWidth / img.width;
      const scaledHeight = img.height * scale;

      canvas.width = containerWidth;
      canvas.height = scaledHeight;

      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showOriginal || !transformations) {
        // Mostrar la imagen original
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Obtener las transformaciones
        const { rotation = 0, scale: imgScale = 1, flipHorizontal = 1, flipVertical = 1, crop } = transformations;

        // Si tenemos un crop, lo aplicamos
        if (crop) {
          // Guardar el estado actual del contexto
          ctx.save();

          // Configurar el centro de transformación en el centro del canvas
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          // Aplicar transformaciones relativas al centro
          ctx.translate(centerX, centerY);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.scale(flipHorizontal, flipVertical);
          ctx.scale(imgScale, imgScale);

          // Calcular dimensiones y posición del recorte
          const cropX = (crop.x / 100) * img.width - (crop.width / 100) * img.width / 2;
          const cropY = (crop.y / 100) * img.height - (crop.height / 100) * img.height / 2;
          const cropWidth = (crop.width / 100) * img.width;
          const cropHeight = (crop.height / 100) * img.height;

          // Dibujar solo la porción recortada
          ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,
            -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
          );

          // Restaurar el contexto
          ctx.restore();
        } else {
          // Si no hay crop, aplicamos las transformaciones a toda la imagen
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.scale(flipHorizontal, flipVertical);
          ctx.scale(imgScale, imgScale);
          ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    } catch (e) {
      console.error('Error al dibujar la imagen en el canvas:', e);
      setUseFallback(true);
    }
  };

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

  // Si hay error CORS o similar, usamos un div con la imagen como fallback
  if (useFallback) {
    return (
      <div
        className="w-100 rounded"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '60vh',
          maxHeight: '70vh'
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="img-fluid w-100 rounded"
      style={{ maxHeight: '70vh', objectFit: 'contain' }}
    />
  );
};

export default DisplayCroppedImage; 