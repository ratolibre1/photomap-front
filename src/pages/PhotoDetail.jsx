import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, ListGroup, Badge, Form, Dropdown, Toast } from 'react-bootstrap';
import { photoService } from '../services/api';
import { useCategories } from '../context/CategoryContext';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [prevPhotoId, setPrevPhotoId] = useState(null);
  const [nextPhotoId, setNextPhotoId] = useState(null);
  const [navLoading, setNavLoading] = useState(false);
  const [photoDeleted, setPhotoDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    isPublic: false,
    categories: [],
    coordinates: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { categories, loading: categoriesLoading } = useCategories();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setLoading(true);
        setImageError(false);

        // Obtener los detalles de la foto actual
        const response = await photoService.getPhoto(id);
        console.log("Detalle de foto:", response.data);

        // Extraer la foto de la estructura correcta
        const currentPhoto = response.data.data.photo || response.data.data;
        setPhoto(currentPhoto);

        // Obtener IDs de foto anterior y siguiente
        try {
          const navResponse = await photoService.getPhotoNavigation(id);
          console.log("Navegación de fotos:", navResponse.data);
          setPrevPhotoId(navResponse.data.data.prevId);
          setNextPhotoId(navResponse.data.data.nextId);
        } catch (navErr) {
          console.error("Error al cargar navegación:", navErr);
          // No mostramos error si falla la navegación, solo desactivamos los botones
        }
      } catch (err) {
        console.error('Error al cargar la foto:', err);
        setError('No se pudo cargar la foto. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  useEffect(() => {
    if (showEditModal && photo) {
      // Formatear las coordenadas como string si existen
      const coordsString = photo.location?.coordinates ?
        `${photo.location.coordinates[1].toFixed(6)}, ${photo.location.coordinates[0].toFixed(6)}` : '';

      setEditForm({
        title: photo.title || '',
        description: photo.description || '',
        isPublic: photo.isPublic || false,
        categories: photo.categories || [],
        coordinates: coordsString
      });
    }
  }, [photo, showEditModal]);

  // Navegar a la foto anterior
  const goToPrevPhoto = () => {
    if (prevPhotoId) {
      setNavLoading(true);
      navigate(`/photo/${prevPhotoId}`);
    }
  };

  // Navegar a la foto siguiente
  const goToNextPhoto = () => {
    if (nextPhotoId) {
      setNavLoading(true);
      navigate(`/photo/${nextPhotoId}`);
    }
  };

  // Función para obtener una ubicación legible
  function getLocationName(location) {
    if (!location || !location.coordinates) return 'Ubicación desconocida';

    // Formato simple de coordenadas
    const [long, lat] = location.coordinates;
    return `${lat.toFixed(5)}, ${long.toFixed(5)}`;
  }

  // Función para eliminar foto actual
  const handleDeletePhoto = async () => {
    try {
      // Aquí irá la llamada al API real
      // await axios.delete(`${API_URL}/photos/${photoId}`);

      setPhotoDeleted(true);
      // Opcional: redirigir después de un tiempo
      setTimeout(() => navigate('/map'), 2000);
    } catch (error) {
      console.error('Error al eliminar la foto:', error);
      setError('No se pudo eliminar la foto. Intenta de nuevo más tarde.');
    }
  };

  // Función para inicializar el formulario con los datos actuales
  const handleEditClick = async () => {
    if (photo) {
      console.log('------ ABRIENDO MODAL DE EDICIÓN ------');
      console.log('Datos completos de la foto:', photo);
      console.log('Campo de visibilidad:', photo.visibility, typeof photo.visibility);
      console.log('Campo isPublic:', photo.isPublic, typeof photo.isPublic);

      console.log('Categorías disponibles actualizadas:', categories);
      console.log('Categorías de la foto actual:', photo.categories);

      const formattedCategories = Array.isArray(photo.categories)
        ? photo.categories.map(cat => typeof cat === 'object' ? cat._id : cat)
        : photo.categories || [];

      console.log('Categorías formateadas para el formulario:', formattedCategories);

      setEditForm({
        title: photo.title || '',
        description: photo.description || '',
        categories: formattedCategories,
        isPublic: photo.visibility === 'public' ||
          photo.visibility === true ||
          photo.isPublic === true ||
          photo.public === true,
        coordinates: photo.location?.coordinates ?
          `${photo.location.coordinates[1].toFixed(6)}, ${photo.location.coordinates[0].toFixed(6)}` : ''
      });

      setShowEditModal(true);
    }
  };

  // Función para manejar cambios en los campos del formulario
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Función para guardar los cambios
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      // Guardar cambios en el servidor
      await photoService.updatePhoto(id, editForm);

      // Cerrar el modal
      setShowEditModal(false);

      // Recargar los datos de la foto para mostrar la información actualizada
      const response = await photoService.getPhoto(id);
      const updatedPhoto = response.data.data.photo || response.data.data;
      setPhoto(updatedPhoto);

      // Mostrar notificación de éxito
      setToastMessage('Foto actualizada correctamente');
      setShowToast(true);

    } catch (error) {
      console.error('Error al actualizar la foto:', error);
      setSaveError('No se pudieron guardar los cambios. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Función para copiar las coordenadas
  const copyCoordinates = () => {
    const coordsText = `${photo.location.coordinates[1].toFixed(6)}, ${photo.location.coordinates[0].toFixed(6)}`;
    navigator.clipboard.writeText(coordsText)
      .then(() => {
        setToastMessage('Coordenadas copiadas al portapapeles');
        setShowToast(true);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
        setToastMessage('No se pudieron copiar las coordenadas');
        setShowToast(true);
      });
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando detalles de la foto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
        <div className="mt-3">
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            Volver a la galería
          </Button>
        </div>
      </Alert>
    );
  }

  if (photoDeleted) {
    return (
      <Container className="py-5 text-center">
        <div className="py-5">
          <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
          <h3>Foto eliminada correctamente</h3>
          <p>Redirigiendo a la galería...</p>
          <Button
            as={Link}
            to="/map"
            variant="primary"
            className="mt-3"
          >
            Volver a la galería
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
        >
          ← Volver a la galería
        </Button>

        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => window.open(photo?.originalUrl, '_blank')}
            disabled={imageError || !photo}
          >
            {imageError ? 'Imagen no disponible' : 'Ver tamaño completo'}
          </Button>
        </div>
      </div>

      {photo ? (
        <Row>
          <Col lg={8} className="mb-4 position-relative">
            {/* Botón de navegación izquierda */}
            {prevPhotoId && (
              <Button
                variant="light"
                className="position-absolute start-0 top-50 translate-middle-y rounded-circle p-2 shadow"
                style={{ zIndex: 10, opacity: 0.8 }}
                onClick={goToPrevPhoto}
                disabled={navLoading}
              >
                <i className="bi bi-chevron-left fs-3"></i>
              </Button>
            )}

            <Card className="shadow-sm">
              <Card.Img
                src={imageError ? 'https://via.placeholder.com/800x600?text=Imagen+no+disponible' : photo.originalUrl}
                alt={photo.title}
                className="img-fluid"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
                onError={() => setImageError(true)}
              />
            </Card>

            {/* Botón de navegación derecha */}
            {nextPhotoId && (
              <Button
                variant="light"
                className="position-absolute end-0 top-50 translate-middle-y rounded-circle p-2 shadow"
                style={{ zIndex: 10, opacity: 0.8 }}
                onClick={goToNextPhoto}
                disabled={navLoading}
              >
                <i className="bi bi-chevron-right fs-3"></i>
              </Button>
            )}
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <h2>{photo.title || 'Sin título'}</h2>

                <p className="text-muted mb-4">
                  {photo.description || 'Sin descripción'}
                </p>

                <strong>Fecha:</strong> {photo.timestamp ? new Date(photo.timestamp).toLocaleString() : 'Desconocida'}
                <hr></hr>
                <strong>Ubicación:</strong>
                {photo.geocodingDetails?.displayName && (
                  <p>{photo.geocodingDetails.displayName}</p>
                )}
                {photo.location?.coordinates && (
                  <p className="text d-flex align-items-center">
                    ({photo.location.coordinates[1].toFixed(6)}, {photo.location.coordinates[0].toFixed(6)})
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={copyCoordinates}
                      title="Copiar coordenadas"
                      className="ms-2 icon-button"
                    >
                      <i className="bi bi-clipboard"></i>
                    </Button>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${photo.location.coordinates[1]},${photo.location.coordinates[0]}`, '_blank')}
                      title="Ver en Google Maps"
                      className="ms-1 icon-button"
                    >
                      <i className="bi bi-globe2"></i>
                    </Button>
                  </p>
                )}

                <hr></hr>

                {photo.metadata && (
                  <div className="mb-3">
                    <strong>Detalles técnicos:</strong>
                    <ul className="list-unstyled mt-2 small">
                      {photo.metadata.camera && <li><strong>Cámara:</strong> {photo.metadata.camera}</li>}
                      {photo.metadata.aperture && <li><strong>Apertura:</strong> {photo.metadata.aperture}</li>}
                      {photo.metadata.shutterSpeed && <li><strong>Velocidad:</strong> {photo.metadata.shutterSpeed}</li>}
                      {photo.metadata.iso && <li><strong>ISO:</strong> {photo.metadata.iso}</li>}
                    </ul>
                  </div>
                )}

                {photo.categories && photo.categories.length > 0 && (
                  <div className="mb-3">
                    <strong>Categorías:</strong>
                    <div className="mt-2">
                      {photo.categories.map(category => (
                        <Badge
                          key={typeof category === 'object' ? category._id : category}
                          bg="secondary"
                          className="me-1 mb-1"
                        >
                          {typeof category === 'object' ? category.name : category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => window.open(photo.originalUrl, '_blank')}
                    disabled={imageError}
                  >
                    {imageError ? 'Imagen no disponible' : 'Ver tamaño completo'}
                  </Button>
                </div>

                {window.location.hostname === 'localhost' && (
                  <div className="mt-4 border-top pt-3">
                    <p className="text-muted small mb-1">Información técnica (solo desarrollo):</p>
                    <div className="bg-light p-2 rounded small">
                      <div>ID: {photo._id}</div>
                      <div>URL original: <a href={photo.originalUrl} target="_blank" rel="noreferrer">{photo.originalUrl}</a></div>
                      <div>URL miniatura: <a href={photo.thumbnailUrl} target="_blank" rel="noreferrer">{photo.thumbnailUrl}</a></div>
                    </div>
                  </div>
                )}

                <div className="action-buttons mt-4 d-flex justify-content-between">
                  <Button
                    variant="outline-primary"
                    onClick={handleEditClick}
                  >
                    <i className="bi bi-pencil-fill me-1"></i>
                    Editar foto
                  </Button>

                  <Button
                    variant="outline-danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Eliminar foto
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">No se encontró la foto solicitada 😕</p>
          <Button variant="primary" onClick={() => navigate('/gallery')}>
            Volver a la galería
          </Button>
        </div>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres eliminar esta foto?</p>
          <p className="text-danger"><strong>Esta acción no se puede deshacer.</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeletePhoto}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar foto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <Alert variant="danger">{saveError}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editForm.description}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categorías</Form.Label>
              <div className="dropdown-categories">
                <Dropdown show={dropdownOpen} onToggle={(isOpen) => setDropdownOpen(isOpen)}>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    id="dropdown-categories"
                    className="w-100 text-start"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {editForm.categories?.length
                      ? `${editForm.categories.length} categorías seleccionadas`
                      : 'Seleccionar categorías'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {categories && categories.length > 0 ? (
                      categories.map(category => {
                        // Extraer ID y nombre de manera más robusta
                        const categoryId = typeof category === 'object' ? (category._id || category.id) : category;
                        const categoryName = typeof category === 'object' ? (category.name || category.title || categoryId) : category;

                        // Comprobar si esta categoría está seleccionada
                        const isChecked = editForm.categories &&
                          editForm.categories.some(c =>
                            (typeof c === 'object' ? (c._id || c.id) : c) === categoryId);

                        return (
                          <Dropdown.Item
                            key={categoryId}
                            as="div"
                            className="px-3 py-2"
                            onClick={(e) => {
                              // Detener la propagación para que el dropdown no se cierre
                              e.stopPropagation();
                            }}
                          >
                            <Form.Check
                              type="checkbox"
                              id={`category-${categoryId}`}
                              label={categoryName}
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                let updatedCategories;

                                if (checked) {
                                  // Añadir categoría
                                  updatedCategories = [...(editForm.categories || []), categoryId];
                                } else {
                                  // Eliminar categoría
                                  updatedCategories = (editForm.categories || [])
                                    .filter(id => {
                                      const idToCompare = typeof id === 'object' ? (id._id || id.id) : id;
                                      return idToCompare !== categoryId;
                                    });
                                }

                                setEditForm({
                                  ...editForm,
                                  categories: updatedCategories
                                });
                              }}
                            />
                          </Dropdown.Item>
                        );
                      })
                    ) : (
                      <Dropdown.Item disabled>No hay categorías disponibles</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Foto pública"
                name="isPublic"
                id="photo-public-switch"
                checked={editForm.isPublic}
                onChange={handleFormChange}
              />
              <Form.Text className="text-muted">
                Las fotos públicas son visibles para cualquier persona con el enlace
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Coordenadas</Form.Label>
              <Form.Control
                type="text"
                name="coordinates"
                value={editForm.coordinates}
                onChange={handleFormChange}
                placeholder="Ej: -33.456789, -70.123456"
              />
              <Form.Text className="text-muted">
                Ingresa las coordenadas en formato "latitud, longitud"
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Guardando...
              </>
            ) : 'Guardar cambios'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast para notificación de copia */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999
        }}
      >
        <Toast.Header>
          <i className="bi bi-info-circle me-2"></i>
          <strong className="me-auto">Notificación</strong>
          <small>ahora</small>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Container>
  );
};

export default PhotoDetail; 