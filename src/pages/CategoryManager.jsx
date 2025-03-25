import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Spinner, Alert, Modal, ListGroup, Badge } from 'react-bootstrap';
import { categoryService, labelService } from '../services/api';
import { useLabels } from '../context/LabelContext';
import LabelBadge from '../components/common/LabelBadge';
import { useTranslation } from 'react-i18next';

const CategoryManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { t } = useTranslation(['categories', 'common']);

  // Estados para etiquetas
  const [editingLabel, setEditingLabel] = useState(null);
  const { categoriesWithLabels, loading: contextLoading, error: contextError, refreshData } = useLabels();

  // En la sección de estados
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [previewLabel, setPreviewLabel] = useState(null);

  // Agregar al inicio del componente
  const [deleteLabelConfirm, setDeleteLabelConfirm] = useState(null);

  // Primero añadimos estado para guardar la etiqueta completa, no solo el ID
  const [labelToDelete, setLabelToDelete] = useState(null);

  // Primero, vamos a crear un estado adicional (similar a labelToDelete)
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Combinar errores del contexto y locales
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Agregar un useEffect para recargar datos cada vez que se monte el componente
  useEffect(() => {
    // Cada vez que se abre la página, recargamos los datos
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array de dependencias vacío = ejecutar solo al montar

  // Función para generar un color aleatorio en formato hexadecimal
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Función para determinar si el color de texto debe ser blanco o negro según el fondo
  const getTextColor = (backgroundColor) => {
    // Convertir color hex a RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calcular luminosidad (fórmula estándar)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si la luminosidad es mayor a 0.5, usar texto negro, de lo contrario blanco
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Función para asegurar que el color esté en formato correcto
  // Esta función no se usa actualmente pero podría ser útil en el futuro
  /* 
  const formatColor = (color) => {
    if (!color) return '#6c757d';
    return color.startsWith('#') ? color : `#${color}`;
  };
  */

  // Abrir modal para crear nueva categoría
  const handleNewCategory = () => {
    setCurrentCategory({ name: '', description: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  // Abrir modal para editar categoría existente
  const handleEditCategory = (category) => {
    setCurrentCategory({ ...category });
    setIsEditing(true);
    setShowModal(true);
  };

  // Guardar categoría (crear o actualizar)
  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        // Actualizar categoría existente
        await categoryService.updateCategory(currentCategory._id, currentCategory);
      } else {
        // Crear nueva categoría
        await categoryService.createCategory(currentCategory);
      }

      // Cerrar el modal
      setShowModal(false);
      setCurrentCategory({ name: '', description: '' });

      // Recargar datos desde el contexto (no toda la página)
      await refreshData();

    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError('Error al guardar la categoría. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      await categoryService.deleteCategory(categoryId);

      // Cerrar modal
      setDeleteConfirm(null);
      setCategoryToDelete(null);

      // Recargar datos desde el contexto
      await refreshData();

    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      setError('No se pudo eliminar la categoría');
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal de edición de etiqueta
  const handleEditLabel = (label) => {
    setEditingLabel({ ...label });
    setPreviewLabel({ ...label });
    setShowLabelModal(true);
  };

  // Función para cambiar el color aleatorio de la etiqueta en edición
  const handleRandomizeColor = () => {
    const newColor = generateRandomColor();
    const newTextColor = getTextColor(newColor);
    setPreviewLabel({
      ...previewLabel,
      color: newColor,
      textColor: newTextColor
    });
  };

  // Función para guardar los cambios en la etiqueta
  const handleSaveLabel = async () => {
    try {
      setLoading(true);
      setError(null);

      if (editingLabel) {
        // Actualizar etiqueta existente
        await labelService.updateLabel(editingLabel._id, {
          name: previewLabel.name,
          color: previewLabel.color,
          textColor: previewLabel.textColor
        });
      } else {
        // Crear nueva etiqueta
        await labelService.createLabel({
          name: previewLabel.name,
          color: previewLabel.color,
          textColor: previewLabel.textColor,
          categoryId: previewLabel.categoryId
        });
      }

      // Cerrar modal
      setShowLabelModal(false);

      // Recargar datos desde el contexto
      await refreshData();

    } catch (err) {
      console.error('Error al guardar la etiqueta:', err);
      setError(`No se pudo ${editingLabel ? 'actualizar' : 'crear'} la etiqueta`);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una etiqueta
  const handleDeleteLabel = async (labelId) => {
    try {
      setLoading(true);
      setError(null);

      await labelService.deleteLabel(labelId);

      // Cerrar confirmación
      setDeleteLabelConfirm(null);
      setLabelToDelete(null);

      // Recargar datos desde el contexto
      await refreshData();

    } catch (err) {
      console.error('Error al eliminar la etiqueta:', err);
      setError('No se pudo eliminar la etiqueta');
    } finally {
      setLoading(false);
    }
  };

  // Simplificamos la función para usar directamente el photoCount existente
  const handleDeleteLabelClick = (label) => {
    // La etiqueta ya tiene photoCount incluido
    setLabelToDelete(label);
    setDeleteLabelConfirm(label._id || label.id);
  };

  // Luego modificamos el botón para guardar la categoría completa
  const handleDeleteCategoryClick = (category) => {
    // Buscar la categoría en el array que tiene las etiquetas con photo count
    const categoryWithLabels = categoriesWithLabels.find(
      c => (c._id || c.id) === (category._id || category.id)
    );

    setCategoryToDelete(categoryWithLabels || category);
    setDeleteConfirm(category._id || category.id);
  };

  // Primero, agregamos una función para manejar la creación de etiquetas
  // (justo después de handleEditLabel)

  const handleNewLabel = (categoryId) => {
    // Generar color aleatorio y su color de texto correspondiente
    const randomColor = generateRandomColor();
    const textColor = getTextColor(randomColor);

    // Inicializar la etiqueta con valores por defecto
    setPreviewLabel({
      name: '',
      color: randomColor,
      textColor: textColor,
      categoryId: categoryId
    });

    // Establecer que estamos creando, no editando
    setEditingLabel(null);

    // Mostrar el modal
    setShowLabelModal(true);
  };

  // En el render, usar el loading combinado
  const isLoading = loading || contextLoading;

  // Dentro del componente, agrega refs para los inputs
  const categoryNameInputRef = useRef(null);
  const labelNameInputRef = useRef(null);

  // Cuando se abre el modal de categoría
  useEffect(() => {
    if (showModal && categoryNameInputRef.current) {
      // Pequeño timeout para asegurar que el modal esté visible
      setTimeout(() => {
        categoryNameInputRef.current.focus();
      }, 100);
    }
  }, [showModal]);

  // Cuando se abre el modal de etiqueta
  useEffect(() => {
    if (showLabelModal && labelNameInputRef.current) {
      // Pequeño timeout para asegurar que el modal esté visible
      setTimeout(() => {
        labelNameInputRef.current.focus();
      }, 100);
    }
  }, [showLabelModal]);

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <h1 className="mb-4">{t('title')}</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {/* Panel para crear/editar categorías */}
        <Col className="mb-4">
          <Card>
            <Card.Header>
              <h4>{t('category.title', 'Categorías')}</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <Button variant="primary" onClick={handleNewCategory}>
                  <i className="bi bi-plus-circle me-2"></i>
                  {t('category.new')}
                </Button>
              </div>

              {/* Lista de categorías con sus etiquetas */}
              {isLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div>
                  {categoriesWithLabels.map(category => (
                    <Card key={category._id || category.id} className="mb-3">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">{category.name}</span>
                        <div>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditCategory(category)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-1"
                            onClick={() => handleDeleteCategoryClick(category)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </Card.Header>

                      <Card.Body>
                        {/* Descripción de la categoría (si existe) */}
                        {category.description && (
                          <p className="text-muted mb-3 small fst-italic">
                            {category.description}
                          </p>
                        )}

                        {/* Botón para crear nueva etiqueta */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mb-3"
                          onClick={() => handleNewLabel(category._id || category.id)}
                        >
                          <i className="bi bi-plus-circle me-1"></i> {t('label.new')}
                        </Button>

                        {/* Mostrar etiquetas de esta categoría como pills */}
                        <div className="d-flex flex-wrap gap-2">
                          {Array.isArray(categoriesWithLabels) &&
                            (() => {
                              // Buscar la categoría correspondiente con sus etiquetas
                              const categoryWithLabels = categoriesWithLabels.find(
                                cat => (cat._id || cat.id) === (category._id || category.id)
                              );

                              console.log('Categoría encontrada:', category.name, categoryWithLabels);

                              if (categoryWithLabels && Array.isArray(categoryWithLabels.labels) && categoryWithLabels.labels.length > 0) {
                                return categoryWithLabels.labels.map(label => {
                                  // Asegurarnos de extraer correctamente el color y color de texto
                                  const bgColor = label.color || '#6c757d';
                                  const txtColor = label.textColor || '#ffffff';

                                  console.log('Etiqueta:', label.name, 'Color:', bgColor, 'TextColor:', txtColor);

                                  return <LabelBadge key={label._id || label.id} label={label} onEdit={handleEditLabel} onDelete={handleDeleteLabelClick} />;
                                });
                              } else {
                                return <span className="text-muted fst-italic">{t('category.no_labels')}</span>;
                              }
                            })()
                          }
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para editar etiqueta */}
      <Modal show={showLabelModal} onHide={() => setShowLabelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingLabel ? t('label.edit') : t('label.new')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewLabel && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>{t('label.name')}</Form.Label>
                <Form.Control
                  ref={labelNameInputRef}
                  type="text"
                  value={previewLabel.name}
                  onChange={(e) => setPreviewLabel({ ...previewLabel, name: e.target.value })}
                  placeholder={t('label.name')}
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('label.color')}</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="color"
                    value={previewLabel.color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      const newTextColor = getTextColor(newColor);
                      setPreviewLabel({
                        ...previewLabel,
                        color: newColor,
                        textColor: newTextColor
                      });
                    }}
                    className="me-2"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleRandomizeColor}
                  >
                    {t('label.random_color')}
                  </Button>
                </div>
              </Form.Group>

              {/* Vista previa */}
              {previewLabel && (
                <div className="mb-3">
                  <Form.Label>{t('label.preview')}:</Form.Label>
                  <div>
                    <LabelBadge
                      label={previewLabel}
                      showEditButton={false}
                      preview={true}
                    />
                  </div>
                </div>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLabelModal(false)}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveLabel}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t('common:loading.default')}
              </>
            ) : t('common:buttons.save')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear/editar categoría */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? t('category.edit') : t('category.new')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('category.name')}</Form.Label>
              <Form.Control
                ref={categoryNameInputRef}
                type="text"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                placeholder={t('category.name')}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('category.description')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentCategory.description || ''}
                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                placeholder={t('category.description_placeholder')}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveCategory}
            disabled={isLoading || !currentCategory.name.trim()}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t('common:loading.default')}
              </>
            ) : isEditing ? t('common:buttons.save') : t('common:buttons.save')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar etiqueta */}
      <Modal show={!!deleteLabelConfirm} onHide={() => {
        setDeleteLabelConfirm(null);
        setLabelToDelete(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{t('common:confirmations.delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('delete.confirm_label', { name: labelToDelete?.name })}</p>

          {labelToDelete && typeof labelToDelete.photoCount !== 'undefined' && (
            <>
              {labelToDelete.photoCount > 0 ? (
                <p className="text-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {t('delete.photos_affected', { count: labelToDelete.photoCount })}
                </p>
              ) : (
                <p className="text-info">
                  <i className="bi bi-info-circle me-2"></i>
                  {t('delete.no_photos')}
                </p>
              )}
            </>
          )}

          <p className="text-danger mt-3">
            <strong>{t('common:confirmations.irreversible')}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setDeleteLabelConfirm(null);
            setLabelToDelete(null);
          }}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteLabel(deleteLabelConfirm)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t('common:loading.default')}
              </>
            ) : t('common:buttons.delete')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar categoría */}
      <Modal show={!!deleteConfirm} onHide={() => {
        setDeleteConfirm(null);
        setCategoryToDelete(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{t('common:confirmations.delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('delete.confirm_category', { name: categoryToDelete?.name })}</p>

          {categoryToDelete && Array.isArray(categoryToDelete.labels) && categoryToDelete.labels.length > 0 ? (
            <>
              <p className="mb-2">{t('delete.labels_to_delete')}</p>
              <div className="bg-light p-2 rounded mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <ListGroup variant="flush">
                  {categoryToDelete.labels.map(label => (
                    <ListGroup.Item key={label._id || label.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <LabelBadge label={label} showEditButton={false} />
                      </div>
                      <div>
                        {typeof label.photoCount !== 'undefined' ? (
                          <Badge bg={label.photoCount > 0 ? "warning" : "secondary"} text={label.photoCount > 0 ? "dark" : "light"}>
                            {label.photoCount} {label.photoCount === 1 ? t('common:photo.singular', 'foto') : t('common:photo.plural', 'fotos')}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">{t('common:photo.unknown', '? fotos')}</Badge>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </>
          ) : (
            <p className="text-info">{t('category.no_labels')}</p>
          )}

          <p className="text-danger mt-3">
            <strong>{t('common:confirmations.irreversible')}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setDeleteConfirm(null);
            setCategoryToDelete(null);
          }}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteCategory(deleteConfirm)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t('common:loading.default')}
              </>
            ) : t('common:buttons.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryManager; 