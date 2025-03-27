import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, ButtonGroup, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DEFAULT_TRANSFORMATIONS = {
  rotation: 0,
  scale: 1,
  flipHorizontal: 1,
  flipVertical: 1,
  offsetX: 0,
  offsetY: 0,
  crop: {
    width: 100,  // porcentaje del ancho original
    height: 100, // porcentaje del alto original
    x: 50,       // posición X del centro (50% = centrado)
    y: 50        // posición Y del centro (50% = centrado)
  }
};

const ImageEditor = ({ image, initialTransformations = {}, onSave }) => {
  const { t } = useTranslation(['photos', 'common']);
  const [transformations, setTransformations] = useState({
    ...DEFAULT_TRANSFORMATIONS,
    ...initialTransformations,
    crop: {
      ...DEFAULT_TRANSFORMATIONS.crop,
      ...(initialTransformations.crop || {})
    }
  });

  // Actualizar transformaciones si cambian las props
  useEffect(() => {
    setTransformations({
      ...DEFAULT_TRANSFORMATIONS,
      ...initialTransformations,
      crop: {
        ...DEFAULT_TRANSFORMATIONS.crop,
        ...(initialTransformations.crop || {})
      }
    });
  }, [initialTransformations]);

  // Calcular el estilo CSS para la imagen transformada
  const getTransformStyle = () => ({
    transform: `
      translate(${transformations.offsetX}%, ${transformations.offsetY}%)
      rotate(${transformations.rotation}deg)
      scale(${transformations.scale})
      scaleX(${transformations.flipHorizontal})
      scaleY(${transformations.flipVertical})
    `,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${transformations.crop.x}% ${transformations.crop.y}%`,
    transition: 'all 0.3s ease-in-out',
  });

  // Estilo para el contenedor de la imagen (bounding box)
  const getContainerStyle = () => ({
    width: `${transformations.crop.width}%`,
    height: `${transformations.crop.height}%`,
    margin: '0 auto',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: '16/9',
    maxHeight: '300px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    borderRadius: '4px'
  });

  // Manejadores para cambios en los controles
  const handleSliderChange = (e) => {
    const { name, value } = e.target;

    // Si es un control de recorte
    if (name.startsWith('crop.')) {
      const cropProperty = name.split('.')[1];
      setTransformations({
        ...transformations,
        crop: {
          ...transformations.crop,
          [cropProperty]: parseFloat(value)
        }
      });
    } else {
      // Si es otro control normal
      setTransformations({
        ...transformations,
        [name]: parseFloat(value)
      });
    }
  };

  const handleFlip = (direction) => {
    setTransformations({
      ...transformations,
      [direction]: transformations[direction] * -1
    });
  };

  const handleReset = () => {
    setTransformations(DEFAULT_TRANSFORMATIONS);
  };

  const handleSave = () => {
    // Llamar a la función onSave con el objeto de transformaciones
    console.log('Guardando transformaciones:', transformations);
    onSave && onSave(transformations);
  };

  return (
    <div className="image-editor">
      {/* Vista previa de la imagen con transformaciones aplicadas */}
      <div className="text-center mb-4 p-3 bg-light rounded">
        <div className="image-preview-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          {image ? (
            <div style={getContainerStyle()}>
              <img
                src={image}
                alt="Preview"
                style={getTransformStyle()}
              />
            </div>
          ) : (
            <div className="text-muted">
              <i className="bi bi-image me-2"></i>
              {t('image_editor.no_image')}
            </div>
          )}
        </div>
      </div>

      {/* Controles de edición */}
      <Card className="mb-3">
        <Card.Header>
          <i className="bi bi-arrows-angle-expand me-2"></i>
          {t('image_editor.transformation')}
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Rotación */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-arrow-repeat me-1"></i>
                {t('image_editor.rotation')} ({transformations.rotation}°)
              </Form.Label>
              <Form.Range
                name="rotation"
                min="-180"
                max="180"
                step="1"
                value={transformations.rotation}
                onChange={handleSliderChange}
              />
            </Form.Group>

            {/* Escala (Zoom) */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-zoom-in me-1"></i>
                {t('image_editor.scale')} ({transformations.scale.toFixed(1)}x)
              </Form.Label>
              <Form.Range
                name="scale"
                min="0.1"
                max="3"
                step="0.1"
                value={transformations.scale}
                onChange={handleSliderChange}
              />
            </Form.Group>

            {/* Desplazamiento X */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-arrows me-1"></i>
                {t('image_editor.position_x')} ({transformations.offsetX}%)
              </Form.Label>
              <Form.Range
                name="offsetX"
                min="-50"
                max="50"
                step="1"
                value={transformations.offsetX}
                onChange={handleSliderChange}
              />
            </Form.Group>

            {/* Desplazamiento Y */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-arrows-vertical me-1"></i>
                {t('image_editor.position_y')} ({transformations.offsetY}%)
              </Form.Label>
              <Form.Range
                name="offsetY"
                min="-50"
                max="50"
                step="1"
                value={transformations.offsetY}
                onChange={handleSliderChange}
              />
            </Form.Group>

            {/* Botones de volteo */}
            <Row className="mb-4">
              <Col>
                <Form.Label>{t('image_editor.flip')}</Form.Label>
                <div>
                  <ButtonGroup>
                    <Button
                      variant={transformations.flipHorizontal === -1 ? "primary" : "outline-primary"}
                      onClick={() => handleFlip('flipHorizontal')}
                    >
                      <i className="bi bi-symmetry-horizontal"></i> {t('image_editor.horizontal')}
                    </Button>
                    <Button
                      variant={transformations.flipVertical === -1 ? "primary" : "outline-primary"}
                      onClick={() => handleFlip('flipVertical')}
                    >
                      <i className="bi bi-symmetry-vertical"></i> {t('image_editor.vertical')}
                    </Button>
                  </ButtonGroup>
                </div>
              </Col>
            </Row>

            {/* Separador */}
            <hr className="my-4" />

            {/* Controles de recorte */}
            <h6 className="mb-3">
              <i className="bi bi-crop me-1"></i>
              {t('image_editor.crop_controls')}
            </h6>

            {/* Ancho del recorte */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-arrows-angle-expand me-1"></i>
                {t('image_editor.crop_width')} ({transformations.crop.width}%)
              </Form.Label>
              <Form.Range
                name="crop.width"
                min="10"
                max="100"
                step="1"
                value={transformations.crop.width}
                onChange={handleSliderChange}
              />
            </Form.Group>

            {/* Alto del recorte */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-arrows-angle-contract me-1"></i>
                {t('image_editor.crop_height')} ({transformations.crop.height}%)
              </Form.Label>
              <Form.Range
                name="crop.height"
                min="10"
                max="100"
                step="1"
                value={transformations.crop.height}
                onChange={handleSliderChange}
              />
            </Form.Group>

            {/* Posición X del recorte */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-arrows-move me-1"></i>
                {t('image_editor.crop_position_x')} ({transformations.crop.x}%)
              </Form.Label>
              <Form.Range
                name="crop.x"
                min="0"
                max="100"
                step="1"
                value={transformations.crop.x}
                onChange={handleSliderChange}
              />
            </Form.Group>

            {/* Posición Y del recorte */}
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-arrows-move me-1"></i>
                {t('image_editor.crop_position_y')} ({transformations.crop.y}%)
              </Form.Label>
              <Form.Range
                name="crop.y"
                min="0"
                max="100"
                step="1"
                value={transformations.crop.y}
                onChange={handleSliderChange}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      {/* Botones de acción */}
      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={handleReset}>
          <i className="bi bi-arrow-counterclockwise me-1"></i>
          {t('image_editor.reset')}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <i className="bi bi-save me-1"></i>
          {t('image_editor.save')}
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor; 