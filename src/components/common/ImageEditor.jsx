import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, ButtonGroup, Card, Accordion, Container } from 'react-bootstrap';
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

// Presets de relación de aspecto para recorte
const CROP_PRESETS = [
  { name: 'Libre', ratio: null, icon: 'bi-bounding-box' },
  { name: '1:1', ratio: 1, icon: 'bi-square-fill' },
  { name: '4:3', ratio: 4 / 3, icon: 'bi-aspect-ratio' },
  { name: '16:9', ratio: 16 / 9, icon: 'bi-aspect-ratio-fill' },
  { name: '3:4', ratio: 3 / 4, icon: 'bi-aspect-ratio' },
  { name: '9:16', ratio: 9 / 16, icon: 'bi-aspect-ratio-fill' },
];

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
  const [activeCropPreset, setActiveCropPreset] = useState(null);

  // Referencias para la interacción de arrastre
  const cropBoxRef = useRef(null);
  const imageContainerRef = useRef(null);

  // Datos de arrastre almacenados directamente en refs para evitar problemas de actualización de estado
  const dragStateRef = useRef({
    isDragging: false,
    dragType: null,
    startX: 0,
    startY: 0,
    startCrop: null
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

  // Manejador para el movimiento de ratón/táctil
  const handleMouseMove = (e) => {
    const dragState = dragStateRef.current;

    if (!dragState.isDragging || !dragState.startCrop || !imageContainerRef.current) {
      return;
    }

    // Prevenir comportamiento predeterminado (necesario para tactil)
    if (e.cancelable) e.preventDefault();

    // Obtener coordenadas actuales
    const currentX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const currentY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const container = imageContainerRef.current.getBoundingClientRect();

    // Calcular delta en porcentaje
    const deltaX = ((currentX - dragState.startX) / container.width) * 100;
    const deltaY = ((currentY - dragState.startY) / container.height) * 100;

    const newCrop = { ...dragState.startCrop };

    // Aplicar cambios según tipo de arrastre
    if (dragState.dragType === 'move') {
      // Mover la caja completa
      newCrop.x = Math.min(Math.max(dragState.startCrop.x + deltaX, newCrop.width / 2), 100 - newCrop.width / 2);
      newCrop.y = Math.min(Math.max(dragState.startCrop.y + deltaY, newCrop.height / 2), 100 - newCrop.height / 2);
    } else {
      // Redimensionar la caja
      const isLeft = dragState.dragType.includes('w');
      const isTop = dragState.dragType.includes('n');
      const isRight = dragState.dragType.includes('e');
      const isBottom = dragState.dragType.includes('s');

      let newWidth = newCrop.width;
      let newHeight = newCrop.height;
      let newX = newCrop.x;
      let newY = newCrop.y;

      // Ajustar dimensiones según la esquina arrastrada
      if (isRight) {
        newWidth = Math.min(Math.max(dragState.startCrop.width + deltaX * 2, 10), 100);
      }
      if (isLeft) {
        newWidth = Math.min(Math.max(dragState.startCrop.width - deltaX * 2, 10), 100);
        newX = dragState.startCrop.x + deltaX;
      }

      if (isBottom) {
        newHeight = Math.min(Math.max(dragState.startCrop.height + deltaY * 2, 10), 100);
      }
      if (isTop) {
        newHeight = Math.min(Math.max(dragState.startCrop.height - deltaY * 2, 10), 100);
        newY = dragState.startCrop.y + deltaY;
      }

      // Mantener proporción si hay un preset seleccionado
      if (activeCropPreset?.ratio) {
        if (isRight || isLeft) {
          newHeight = newWidth / activeCropPreset.ratio;
        } else {
          newWidth = newHeight * activeCropPreset.ratio;
        }
      }

      // Actualizar datos
      newCrop.width = newWidth;
      newCrop.height = newHeight;
      newCrop.x = newX;
      newCrop.y = newY;

      // Validar límites
      if (newCrop.x - newCrop.width / 2 < 0) newCrop.x = newCrop.width / 2;
      if (newCrop.y - newCrop.height / 2 < 0) newCrop.y = newCrop.height / 2;
      if (newCrop.x + newCrop.width / 2 > 100) newCrop.x = 100 - newCrop.width / 2;
      if (newCrop.y + newCrop.height / 2 > 100) newCrop.y = 100 - newCrop.height / 2;
    }

    // Actualizar transformaciones directamente
    setTransformations(prev => ({
      ...prev,
      crop: newCrop
    }));
  };

  // Finalizar arrastre
  const handleMouseUp = () => {
    if (!dragStateRef.current.isDragging) return;

    // Restablecer estado de arrastre
    dragStateRef.current.isDragging = false;
    dragStateRef.current.dragType = null;
    dragStateRef.current.startCrop = null;

    // Quitar event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchend', handleMouseUp);
    document.removeEventListener('touchcancel', handleMouseUp);
  };

  // Iniciar arrastre
  const handleMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    // Si ya hay un arrastre activo, finalizarlo primero
    if (dragStateRef.current.isDragging) {
      handleMouseUp();
    }

    // Inicializar datos de arrastre
    dragStateRef.current.isDragging = true;
    dragStateRef.current.dragType = type;
    dragStateRef.current.startX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    dragStateRef.current.startY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    dragStateRef.current.startCrop = { ...transformations.crop };

    // Agregar event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchcancel', handleMouseUp);
  };

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
    setActiveCropPreset(null);
  };

  const handleSave = () => {
    // Llamar a la función onSave con el objeto de transformaciones
    onSave && onSave(transformations);
  };

  // Aplicar un preset de relación de aspecto
  const applyAspectRatioPreset = (preset) => {
    // Si es modo libre, solo actualizar el estado activo
    if (preset.ratio === null) {
      setActiveCropPreset(preset);
      return;
    }

    // Mantener el área total similar, ajustando ancho/alto según la relación
    const newWidth = Math.min(100, Math.sqrt(preset.ratio * 100 * 100));
    const newHeight = Math.min(100, newWidth / preset.ratio);

    setTransformations({
      ...transformations,
      crop: {
        ...transformations.crop,
        width: newWidth,
        height: newHeight,
        x: 50, // Centrar
        y: 50  // Centrar
      }
    });

    setActiveCropPreset(preset);
  };

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
    objectFit: 'contain',
    objectPosition: `${transformations.crop.x}% ${transformations.crop.y}%`,
    transition: dragStateRef.current.isDragging ? 'none' : 'all 0.3s ease-in-out',
    pointerEvents: 'none'
  });

  // Estilo para el contenedor de la imagen
  const getContainerStyle = () => ({
    width: '100%',
    height: '100%',
    margin: '0 auto',
    overflow: 'hidden',
    position: 'relative',
    maxHeight: '450px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    borderRadius: '4px'
  });

  // Estilo para el cuadro de recorte
  const getCropBoxStyle = () => ({
    position: 'absolute',
    width: `${transformations.crop.width}%`,
    height: `${transformations.crop.height}%`,
    left: `${transformations.crop.x - (transformations.crop.width / 2)}%`,
    top: `${transformations.crop.y - (transformations.crop.height / 2)}%`,
    border: dragStateRef.current.isDragging && dragStateRef.current.dragType === 'move' ? '2px solid #2196F3' : '2px solid white',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    cursor: dragStateRef.current.isDragging ? (dragStateRef.current.dragType === 'move' ? 'grabbing' : 'crosshair') : 'grab',
    zIndex: 10,
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  });

  // Renderizar los manejadores (handles) para redimensionar
  const renderResizeHandles = () => {
    const handleStyle = {
      position: 'absolute',
      width: '24px',  // Aún más grandes para ser más fáciles de agarrar
      height: '24px',
      backgroundColor: 'white',
      border: '1px solid rgba(0, 0, 0, 0.5)',
      borderRadius: '50%',
      zIndex: 20,
      touchAction: 'none',
      cursor: 'crosshair',
      boxShadow: '0 0 5px rgba(0,0,0,0.5)'
    };

    // Evento combinado para mouse y touch
    const handlePointerDown = (e, type) => {
      e.stopPropagation();  // Evitar que afecte al drag de la caja
      handleMouseDown(e, type);
    };

    return (
      <>
        {/* Esquina superior izquierda */}
        <div
          style={{ ...handleStyle, top: '-12px', left: '-12px', cursor: 'nw-resize' }}
          onMouseDown={(e) => handlePointerDown(e, 'nw')}
          onTouchStart={(e) => handlePointerDown(e, 'nw')}
          className="resize-handle"
        />
        {/* Esquina superior derecha */}
        <div
          style={{ ...handleStyle, top: '-12px', right: '-12px', cursor: 'ne-resize' }}
          onMouseDown={(e) => handlePointerDown(e, 'ne')}
          onTouchStart={(e) => handlePointerDown(e, 'ne')}
          className="resize-handle"
        />
        {/* Esquina inferior izquierda */}
        <div
          style={{ ...handleStyle, bottom: '-12px', left: '-12px', cursor: 'sw-resize' }}
          onMouseDown={(e) => handlePointerDown(e, 'sw')}
          onTouchStart={(e) => handlePointerDown(e, 'sw')}
          className="resize-handle"
        />
        {/* Esquina inferior derecha */}
        <div
          style={{ ...handleStyle, bottom: '-12px', right: '-12px', cursor: 'se-resize' }}
          onMouseDown={(e) => handlePointerDown(e, 'se')}
          onTouchStart={(e) => handlePointerDown(e, 'se')}
          className="resize-handle"
        />
      </>
    );
  };

  return (
    <Container fluid className="image-editor px-0">
      <Row>
        {/* Lado izquierdo: Imagen más grande (2/3 del ancho) */}
        <Col lg={8} md={7} className="mb-4">
          <div
            className="image-preview-container bg-light rounded p-3 d-flex justify-content-center align-items-center"
            style={{ minHeight: '500px', height: '100%' }}
            ref={imageContainerRef}
          >
            {image ? (
              <div style={getContainerStyle()} className="position-relative">
                <img
                  src={image}
                  alt="Preview"
                  style={getTransformStyle()}
                  draggable="false"
                />

                {/* Caja de recorte interactiva */}
                <div
                  ref={cropBoxRef}
                  style={getCropBoxStyle()}
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                  onTouchStart={(e) => handleMouseDown(e, 'move')}
                  className="crop-box"
                >
                  {/* Mensaje guía cuando se arrastra */}
                  {dragStateRef.current.isDragging && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}>
                      {dragStateRef.current.dragType === 'move' ? 'Moviendo' : 'Redimensionando'}
                    </div>
                  )}

                  {/* Cuadrícula dentro de la caja de recorte */}
                  <div className="crop-grid" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none'
                  }}>
                    {/* Líneas verticales */}
                    <div style={{
                      position: 'absolute',
                      left: '33.33%',
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      left: '66.66%',
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}></div>

                    {/* Líneas horizontales */}
                    <div style={{
                      position: 'absolute',
                      top: '33.33%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '66.66%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: 'rgba(255,255,255,0.7)'
                    }}></div>
                  </div>

                  {/* Manejadores para redimensionar */}
                  {renderResizeHandles()}
                </div>
              </div>
            ) : (
              <div className="text-muted">
                <i className="bi bi-image me-2"></i>
                {t('image_editor.no_image')}
              </div>
            )}
          </div>

          {/* Presets de recorte estilo App de fotos */}
          <div className="crop-presets mt-3 mb-4">
            <div className="d-flex justify-content-center">
              <div className="crop-preset-container bg-dark p-2 rounded-pill d-flex">
                {CROP_PRESETS.map((preset, index) => (
                  <Button
                    key={index}
                    variant={activeCropPreset === preset ? "primary" : "dark"}
                    className="mx-1 rounded-pill d-flex flex-column align-items-center justify-content-center"
                    style={{ width: '60px', height: '40px' }}
                    onClick={() => applyAspectRatioPreset(preset)}
                  >
                    <i className={`${preset.icon} fs-6`}></i>
                    <small className="mt-1">{preset.name}</small>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Col>

        {/* Lado derecho: Panel de controles (1/3 del ancho) */}
        <Col lg={4} md={5}>
          <Accordion defaultActiveKey="0" className="mb-3">
            {/* Sección de transformaciones */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <i className="bi bi-arrows-angle-expand me-2"></i>
                {t('image_editor.transformation')}
              </Accordion.Header>
              <Accordion.Body>
                <Form>
                  {/* Grupo: Rotación y Escala */}
                  <div className="border-bottom pb-3 mb-3">
                    {/* Rotación */}
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <i className="bi bi-arrow-repeat me-2"></i>
                        {t('image_editor.rotation')}
                        <span className="ms-auto badge bg-light text-dark">{transformations.rotation}°</span>
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
                      <Form.Label className="d-flex align-items-center">
                        <i className="bi bi-zoom-in me-2"></i>
                        {t('image_editor.scale')}
                        <span className="ms-auto badge bg-light text-dark">{transformations.scale.toFixed(1)}x</span>
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
                  </div>

                  {/* Botones de volteo - ahora en el panel lateral */}
                  <div className="mb-3">
                    <Form.Label className="d-flex align-items-center mb-2">
                      <i className="bi bi-symmetry-horizontal me-2"></i>
                      {t('image_editor.flip')}
                    </Form.Label>
                    <ButtonGroup className="d-flex">
                      <Button
                        variant={transformations.flipHorizontal === -1 ? "primary" : "outline-primary"}
                        onClick={() => handleFlip('flipHorizontal')}
                        className="flex-grow-1"
                      >
                        <i className="bi bi-symmetry-horizontal me-1"></i> {t('image_editor.horizontal')}
                      </Button>
                      <Button
                        variant={transformations.flipVertical === -1 ? "primary" : "outline-primary"}
                        onClick={() => handleFlip('flipVertical')}
                        className="flex-grow-1"
                      >
                        <i className="bi bi-symmetry-vertical me-1"></i> {t('image_editor.vertical')}
                      </Button>
                    </ButtonGroup>
                  </div>

                  {/* Grupos de controles de posicionamiento que ya no son necesarios (removidos) */}
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

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
        </Col>
      </Row>
    </Container>
  );
};

export default ImageEditor; 