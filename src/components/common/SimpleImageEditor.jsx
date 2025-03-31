import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const SimpleImageEditor = ({ imageUrl, edited = false, initialTransformations = {}, onSave }) => {
  const { t } = useTranslation(['photos', 'common']);
  const [transformations, setTransformations] = useState({
    rotation: 0,
    scale: 1,
    flipHorizontal: 1,
    flipVertical: 1,
    crop: { x: 50, y: 50, width: 100, height: 100 }
  });
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [error, setError] = useState(false);
  // Variable para controlar el estado de arrastre del slider de rotación
  const [isRotating, setIsRotating] = useState(false);

  // Inicializar desde transformaciones existentes
  useEffect(() => {
    if (initialTransformations && Object.keys(initialTransformations).length > 0) {
      setTransformations({
        rotation: initialTransformations.rotation || 0,
        scale: initialTransformations.scale || 1,
        flipHorizontal: initialTransformations.flipHorizontal || 1,
        flipVertical: initialTransformations.flipVertical || 1,
        crop: initialTransformations.crop || { x: 50, y: 50, width: 100, height: 100 }
      });
      setIsEdited(edited !== undefined ? edited : false);
    }
  }, [initialTransformations]);

  // Cargar la imagen
  useEffect(() => {
    if (!imageUrl) return;

    setLoading(true);
    setError(false);

    const img = new Image();
    img.src = imageUrl;
    imgRef.current = img;

    img.onload = () => {
      setLoading(false);
      drawImage();
    };

    img.onerror = () => {
      setLoading(false);
      setError(true);
      console.error('Error al cargar la imagen:', imageUrl);
    };
  }, [imageUrl]);

  // Dibujar la imagen cuando cambian las transformaciones
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && !loading) {
      drawImage();
    }
  }, [transformations, loading, previewMode]);

  // Función para auto-ajustar a múltiplos de 90°
  const snapToNearestAngle = (angle) => {
    // Normalizar el ángulo entre 0 y 360
    const normalizedAngle = ((angle % 360) + 360) % 360;

    // Umbral para el auto-ajuste (grados)
    const snapThreshold = 5;

    // Verificar cercanía a múltiplos de 90°
    if (Math.abs(normalizedAngle) < snapThreshold || Math.abs(normalizedAngle - 360) < snapThreshold) {
      return 0; // Snap a 0°
    }
    if (Math.abs(normalizedAngle - 90) < snapThreshold) {
      return 90; // Snap a 90°
    }
    if (Math.abs(normalizedAngle - 180) < snapThreshold) {
      return 180; // Snap a 180°
    }
    if (Math.abs(normalizedAngle - 270) < snapThreshold) {
      return 270; // Snap a 270°
    }

    // Si no está cerca de ningún múltiplo, devolver el valor original
    return normalizedAngle;
  };

  const drawImage = () => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;

    try {
      // Ajustar el canvas al tamaño del contenedor
      const containerWidth = canvas.parentElement?.clientWidth || 400;
      const scale = containerWidth / img.width;
      const scaledHeight = img.height * scale;

      canvas.width = containerWidth;
      canvas.height = scaledHeight;

      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (previewMode) {
        // Mostrar la imagen original
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Aplicar transformaciones
        const { rotation, scale: imgScale, flipHorizontal, flipVertical, crop } = transformations;

        // Guardar el estado actual del contexto
        ctx.save();

        // Configurar el centro de transformación
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Aplicar transformaciones
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(flipHorizontal, flipVertical);
        ctx.scale(imgScale, imgScale);

        if (crop && (crop.width < 100 || crop.height < 100 || crop.x !== 50 || crop.y !== 50)) {
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
        } else {
          // Si todo está en valores por defecto, dibujamos toda la imagen
          ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        }

        // Restaurar el contexto
        ctx.restore();
      }
    } catch (e) {
      console.error('Error al dibujar la imagen en el canvas:', e);
      setError(true);
    }
  };

  const handleRotate = (direction) => {
    setTransformations(prev => ({
      ...prev,
      rotation: prev.rotation + (direction === 'right' ? 90 : -90)
    }));
    markAsEdited();
  };

  const handleRotationChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setTransformations(prev => ({
      ...prev,
      rotation: newValue
    }));
    markAsEdited();
  };

  const handleRotationEnd = () => {
    setIsRotating(false);

    // Aplicar auto-ajuste cuando se suelta el slider
    setTransformations(prev => ({
      ...prev,
      rotation: snapToNearestAngle(prev.rotation)
    }));
    markAsEdited();
  };

  const handleFlip = (direction) => {
    setTransformations(prev => ({
      ...prev,
      [direction === 'horizontal' ? 'flipHorizontal' : 'flipVertical']:
        prev[direction === 'horizontal' ? 'flipHorizontal' : 'flipVertical'] * -1
    }));
    markAsEdited();
  };

  const handleZoom = (value) => {
    setTransformations(prev => ({
      ...prev,
      scale: parseFloat(value)
    }));
    markAsEdited();
  };

  const handleCropChange = (property, value) => {
    setTransformations(prev => ({
      ...prev,
      crop: {
        ...prev.crop,
        [property]: parseFloat(value)
      }
    }));
    markAsEdited();
  };

  const handleReset = () => {
    setTransformations({
      rotation: 0,
      scale: 1,
      flipHorizontal: 1,
      flipVertical: 1,
      crop: { x: 50, y: 50, width: 100, height: 100 }
    });
    setIsEdited(false);
  };

  const handleSave = () => {
    // Solo imprimimos en consola
    console.log('Guardando transformaciones:', transformations);
    console.log('Estado de edición:', isEdited);

    // Si hay un callback onSave, lo llamamos con transformaciones y el flag edited
    if (onSave) {
      const transformationsWithFlag = {
        ...transformations,
        edited: isEdited
      };
      onSave(transformationsWithFlag);
    }
  };

  // Formatear el ángulo para mostrar
  const formatRotationAngle = (angle) => {
    // Normalizar entre 0 y 360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    return normalizedAngle.toFixed(1) + '°';
  };

  // Determinar si el ángulo actual está en un "punto de ajuste"
  const isAtSnapPoint = (angle) => {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    return [0, 90, 180, 270].some(snap => Math.abs(normalizedAngle - snap) < 0.1);
  };

  // Función para marcar como editada
  const markAsEdited = () => {
    setIsEdited(true);
  };

  if (error) {
    return (
      <div className="text-center p-5 bg-light rounded">
        <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
        <p className="mt-3">{t('detail.image_unavailable')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{t('common:loading.default')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-image-editor">
      <Row>
        <Col md={8} className="mb-4">
          <div className="canvas-container bg-light rounded p-2 d-flex justify-content-center">
            <canvas
              ref={canvasRef}
              className="img-fluid w-100 rounded"
              style={{ maxHeight: '60vh' }}
            />
          </div>

          <div className="preview-toggle d-flex justify-content-center mt-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? t('photos:image_editor.show_edited') : t('photos:image_editor.show_original')}
            </Button>
          </div>
        </Col>

        <Col md={4}>
          <div className="controls bg-light p-3 rounded">
            <h5 className="mb-3">{t('photos:image_editor.transformations')}</h5>

            <div className="mb-3">
              <label className="form-label d-flex justify-content-between align-items-center">
                <span>{t('photos:image_editor.rotation')}</span>
                <span className={`badge fs-6 ${isAtSnapPoint(transformations.rotation) ? 'bg-success' : 'bg-primary'}`} style={{ minWidth: '60px', textAlign: 'center' }}>
                  {formatRotationAngle(transformations.rotation)}
                </span>
              </label>

              {/* Slider para rotación libre */}
              <Form.Range
                min="0"
                max="359.9"
                step="0.1"
                value={((transformations.rotation % 360) + 360) % 360}
                onChange={handleRotationChange}
                onMouseDown={() => setIsRotating(true)}
                onMouseUp={handleRotationEnd}
                onTouchStart={() => setIsRotating(true)}
                onTouchEnd={handleRotationEnd}
                className={isRotating ? "slider-active" : ""}
              />

              {/* Botones para rotación rápida de 90° */}
              <div className="d-flex gap-2 mt-2">
                <Button variant="outline-primary" size="sm" onClick={() => handleRotate('left')}>
                  <i className="bi bi-arrow-counterclockwise"></i> -90°
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => handleRotate('right')}>
                  <i className="bi bi-arrow-clockwise"></i> +90°
                </Button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label d-flex justify-content-between align-items-center">
                <span>{t('photos:image_editor.zoom')}</span>
                <span className="badge bg-primary fs-6" style={{ minWidth: '60px', textAlign: 'center' }}>{transformations.scale.toFixed(1)}x</span>
              </label>
              <Form.Range
                min="0.5"
                max="2"
                step="0.1"
                value={transformations.scale}
                onChange={(e) => handleZoom(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">{t('photos:image_editor.flip')}</label>
              <div className="d-flex gap-2">
                <Button
                  variant={transformations.flipHorizontal === -1 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => handleFlip('horizontal')}
                >
                  <i className="bi bi-symmetry-horizontal"></i> {t('photos:image_editor.flip_horizontal')}
                </Button>
                <Button
                  variant={transformations.flipVertical === -1 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => handleFlip('vertical')}
                >
                  <i className="bi bi-symmetry-vertical"></i> {t('photos:image_editor.flip_vertical')}
                </Button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">{t('photos:image_editor.crop')}</label>

              <Form.Group className="mb-2">
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>X (%)</span>
                  <span className="badge bg-primary fs-6" style={{ minWidth: '60px', textAlign: 'center' }}>{transformations.crop?.x || 0}%</span>
                </Form.Label>
                <Form.Range
                  min="0"
                  max="100"
                  value={transformations.crop?.x || 0}
                  onChange={(e) => handleCropChange('x', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Y (%)</span>
                  <span className="badge bg-primary fs-6" style={{ minWidth: '60px', textAlign: 'center' }}>{transformations.crop?.y || 0}%</span>
                </Form.Label>
                <Form.Range
                  min="0"
                  max="100"
                  value={transformations.crop?.y || 0}
                  onChange={(e) => handleCropChange('y', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>{t('photos:image_editor.width')} (%)</span>
                  <span className="badge bg-primary fs-6" style={{ minWidth: '60px', textAlign: 'center' }}>{transformations.crop?.width || 0}%</span>
                </Form.Label>
                <Form.Range
                  min="10"
                  max="100"
                  value={transformations.crop?.width || 0}
                  onChange={(e) => handleCropChange('width', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>{t('photos:image_editor.height')} (%)</span>
                  <span className="badge bg-primary fs-6" style={{ minWidth: '60px', textAlign: 'center' }}>{transformations.crop?.height || 0}%</span>
                </Form.Label>
                <Form.Range
                  min="10"
                  max="100"
                  value={transformations.crop?.height || 0}
                  onChange={(e) => handleCropChange('height', e.target.value)}
                />
              </Form.Group>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                onClick={handleReset}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                {t('photos:image_editor.restore_original')}
              </Button>

              <Button
                variant="primary"
                onClick={handleSave}
              >
                <i className="bi bi-check-lg me-1"></i>
                {t('common:actions.save')}
              </Button>
            </div>

            {/* Estilo para resaltar el slider cuando está activo */}
            <style jsx>{`
              .slider-active {
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
              }
            `}</style>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SimpleImageEditor; 