import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form, Toast } from 'react-bootstrap';
import { photoService } from '../services/api';
import { useLabels } from '../context/LabelContext';
import LabelBadge from '../components/common/LabelBadge';
import LabelSelector from '../components/common/LabelSelector';
import { useTranslation } from 'react-i18next';
import DisplayCroppedImage from '../components/common/DisplayCroppedImage';
import SimpleImageEditor from '../components/common/SimpleImageEditor';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['photos', 'common']);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoDeleted, setPhotoDeleted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    labels: [],
    isPublic: false,
    coordinates: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [nextPhotoId, setNextPhotoId] = useState(null);
  const [prevPhotoId, setPrevPhotoId] = useState(null);
  const [navLoading, setNavLoading] = useState(false);
  const { categoriesWithLabels, loading: labelsLoading, refreshData: refreshLabels } = useLabels();
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageTransformations, setImageTransformations] = useState({});
  const [showOriginalPhoto, setShowOriginalPhoto] = useState(false);

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

        // Si no hay transformaciones, establecemos los valores por defecto
        if (!currentPhoto.cssTransform) {
          currentPhoto.cssTransform = {
            rotation: 0,
            scale: 1,
            flipHorizontal: 1,
            flipVertical: 1
            // crop estará ausente si no se ha configurado
          };
        }

        // Guardamos la foto en el estado
        setPhoto(currentPhoto);

        // Establecer las transformaciones en el estado
        setImageTransformations(currentPhoto.cssTransform);

        // Logs para depuración
        console.log("cssTransform cargado:", currentPhoto.cssTransform);
        console.log("Etiquetas de la foto:", currentPhoto.labels);
        console.log("Tipo de etiquetas:", Array.isArray(currentPhoto.labels) ? "Array" : typeof currentPhoto.labels);

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
        setError(t('detail.not_found'));
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id, t]);

  useEffect(() => {
    if (showEditModal && photo) {
      const coordsString = photo.location?.coordinates ?
        `${photo.location.coordinates[1].toFixed(6)}, ${photo.location.coordinates[0].toFixed(6)}` : '';

      setEditForm({
        title: photo.title || '',
        description: photo.description || '',
        isPublic: photo.isPublic || false,
        labels: photo.labels || [],
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
      setError(t('delete.error'));
    }
  };

  // Función para inicializar el formulario con los datos actuales
  const handleEditClick = async () => {
    if (photo) {
      const formattedLabels = Array.isArray(photo.labels)
        ? photo.labels.map(cat => typeof cat === 'object' ? cat._id : cat)
        : photo.labels || [];

      setEditForm({
        title: photo.title || '',
        description: photo.description || '',
        labels: formattedLabels,
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

      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('isPublic', editForm.isPublic);
      formData.append('coordinates', editForm.coordinates);

      // Convertir etiquetas a array de IDs antes de enviar
      const labelIds = editForm.labels.map(label => label._id || label.id);
      formData.append('labels', labelIds);

      // Enviar formData al API
      await photoService.updatePhoto(id, formData);

      // Actualizar el contexto de etiquetas para reflejar los cambios en los contadores
      await refreshLabels();

      // Cerrar el modal
      setShowEditModal(false);

      // Recargar los datos de la foto para mostrar la información actualizada
      const response = await photoService.getPhoto(id);
      const updatedPhoto = response.data.data.photo || response.data.data;
      setPhoto(updatedPhoto);

      // Mostrar notificación de éxito
      setToastMessage(t('edit.save_success'));
      setShowToast(true);

    } catch (error) {
      console.error('Error al actualizar la foto:', error);
      setSaveError(t('edit.save_error'));
    } finally {
      setSaving(false);
    }
  };

  // Función para copiar las coordenadas
  const copyCoordinates = () => {
    const coordsText = `${photo.location.coordinates[1].toFixed(6)}, ${photo.location.coordinates[0].toFixed(6)}`;
    navigator.clipboard.writeText(coordsText)
      .then(() => {
        setToastMessage(t('toast.coordinates_copied'));
        setShowToast(true);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
        setToastMessage(t('toast.coordinates_error'));
        setShowToast(true);
      });
  };

  // Añadir estos manejadores antes del return
  const handleRemoveLabel = (labelToRemove) => {
    setEditForm({
      ...editForm,
      labels: editForm.labels.filter(label =>
        (label._id || label.id) !== (labelToRemove._id || labelToRemove.id)
      )
    });
  };

  const handleAddLabel = (labelToAdd) => {
    // Verificar si la etiqueta ya está en la lista
    const isAlreadyAdded = editForm.labels.some(label =>
      typeof label === 'object'
        ? (label._id || label.id) === (labelToAdd._id || labelToAdd.id)
        : label === (labelToAdd._id || labelToAdd.id)
    );

    if (!isAlreadyAdded) {
      setEditForm({
        ...editForm,
        labels: [...editForm.labels, labelToAdd]
      });
    }
  };

  // Manejador para guardar transformaciones de imagen
  const handleSaveImageTransformations = async (transformations) => {
    console.log("Transformaciones a guardar:", transformations);

    try {
      // Extraemos el flag edited
      const { edited, ...cssTransform } = transformations;

      // Actualizamos el estado local primero para mejor UX
      setImageTransformations(cssTransform);

      // Actualizar también en el objeto photo para que se refleje en la UI
      setPhoto(prevPhoto => ({
        ...prevPhoto,
        cssTransform,
        edited // Guardamos el flag en el objeto photo
      }));

      // Hacer la llamada al API para guardar las transformaciones
      await photoService.updatePhotoTransform(id, transformations);

      // Cerrar el editor
      setShowImageEditor(false);

      // Mostrar mensaje de éxito
      setToastMessage(t('photos:image_editor.saved'));
      setShowToast(true);
    } catch (error) {
      console.error("Error al guardar transformaciones:", error);
      setToastMessage("Error al guardar las transformaciones. Intenta nuevamente.");
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common:loading.default')}</span>
        </Spinner>
        <p className="mt-2">{t('detail.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
        <div className="mt-3">
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            {t('detail.back_to_gallery')}
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
          <h3>{t('delete.success')}</h3>
          <p>{t('delete.redirecting')}</p>
          <Button
            as={Link}
            to="/map"
            variant="primary"
            className="mt-3"
          >
            {t('detail.back_to_gallery')}
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
          ← {t('detail.back_to_gallery')}
        </Button>

        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => window.open(photo?.originalUrl, '_blank')}
            disabled={imageError || !photo}
          >
            {imageError ? t('detail.image_unavailable') : t('detail.view_full_size')}
          </Button>

          {/* Botón para editar imagen */}
          <Button
            variant="outline-secondary"
            onClick={() => setShowImageEditor(true)}
            disabled={imageError || !photo}
          >
            <i className="bi bi-crop me-1"></i>
            {t('actions.edit_image')}
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
                title={t('navigation.prev')}
              >
                <i className="bi bi-chevron-left fs-3"></i>
              </Button>
            )}

            {/* Botón de navegación derecha */}
            {nextPhotoId && (
              <Button
                variant="light"
                className="position-absolute end-0 top-50 translate-middle-y rounded-circle p-2 shadow"
                style={{ zIndex: 10, opacity: 0.8 }}
                onClick={goToNextPhoto}
                disabled={navLoading}
                title={t('navigation.next')}
              >
                <i className="bi bi-chevron-right fs-3"></i>
              </Button>
            )}

            {/* Botón para alternar entre original y editada - solo visible si hay transformaciones y el flag edited es true */}
            {photo.cssTransform && photo.edited && (
              <div className="w-100 mb-2">
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => setShowOriginalPhoto(!showOriginalPhoto)}
                >
                  {showOriginalPhoto ? t('photos:image_editor.show_edited') : t('photos:image_editor.show_original')}
                </Button>
              </div>
            )}

            <Card className="shadow-sm">
              <div style={{ maxHeight: '70vh', overflow: 'hidden' }}>
                <DisplayCroppedImage
                  imageUrl={photo.originalUrl}
                  transformations={showOriginalPhoto ? null : photo.cssTransform}
                  showOriginal={showOriginalPhoto}
                />
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <h2>{photo.title || t('detail.no_title')}</h2>

                <p className="text-muted mb-4">
                  {photo.description || t('detail.no_description')}
                </p>

                <strong>{t('detail.date')}:</strong> {photo.timestamp ? new Date(photo.timestamp).toLocaleString() : t('detail.unknown_date')}
                <hr></hr>
                <strong>{t('detail.location')}:</strong>
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
                      title={t('detail.copy_coordinates')}
                      className="ms-2 icon-button"
                    >
                      <i className="bi bi-clipboard"></i>
                    </Button>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${photo.location.coordinates[1]},${photo.location.coordinates[0]}`, '_blank')}
                      title={t('detail.view_in_maps')}
                      className="ms-1 icon-button"
                    >
                      <i className="bi bi-globe2"></i>
                    </Button>
                  </p>
                )}

                <hr></hr>

                {photo.metadata && (
                  <div className="mb-3">
                    <strong>{t('detail.technical_details')}:</strong>
                    <ul className="list-unstyled mt-2 small">
                      {photo.metadata.camera && <li><strong>{t('detail.camera')}:</strong> {photo.metadata.camera}</li>}
                      {photo.metadata.aperture && <li><strong>{t('detail.aperture')}:</strong> {photo.metadata.aperture}</li>}
                      {photo.metadata.shutterSpeed && <li><strong>{t('detail.shutter_speed')}:</strong> {photo.metadata.shutterSpeed}</li>}
                      {photo.metadata.iso && <li><strong>{t('detail.iso')}:</strong> {photo.metadata.iso}</li>}
                    </ul>
                  </div>
                )}

                <div className="mb-3">
                  <strong>{t('detail.labels')}:</strong>
                  <div className="d-flex flex-wrap gap-2">
                    {Array.isArray(photo.labels) && photo.labels.length > 0 ? (
                      photo.labels.map(label => (
                        <LabelBadge
                          key={label._id || label.id}
                          label={label}
                          showEditButton={false}
                        />
                      ))
                    ) : (
                      <span className="text-muted">{t('detail.no_labels')}</span>
                    )}
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => window.open(photo.originalUrl, '_blank')}
                    disabled={imageError}
                  >
                    {imageError ? t('detail.image_unavailable') : t('detail.view_full_size')}
                  </Button>

                  {/* Nuevo botón para editar la imagen */}
                  <Button
                    variant="outline-info"
                    onClick={() => setShowImageEditor(true)}
                    disabled={imageError}
                  >
                    <i className="bi bi-crop me-1"></i>
                    {t('photos:image_editor.title')}
                  </Button>
                </div>

                {window.location.hostname === 'localhost' && (
                  <div className="mt-4 border-top pt-3">
                    <p className="text-muted small mb-1">{t('detail.debug_info')}:</p>
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
                    {t('actions.edit')}
                  </Button>

                  <Button
                    variant="outline-danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    {t('actions.delete')}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">{t('detail.not_found')}</p>
          <Button variant="primary" onClick={() => navigate('/gallery')}>
            {t('detail.back_to_gallery')}
          </Button>
        </div>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('delete.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('delete.confirm')}</p>
          <p className="text-danger"><strong>{t('delete.warning')}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common:buttons.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeletePhoto}>
            {t('common:buttons.delete')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('edit.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <Alert variant="danger">{saveError}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('edit.photo_title')}</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('edit.description')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editForm.description}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('edit.labels')}</Form.Label>
              {labelsLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <LabelSelector
                  selectedLabels={editForm.labels.map(label =>
                    typeof label === 'object' ? label :
                      categoriesWithLabels
                        .flatMap(cat => cat.labels || [])
                        .find(l => (l._id || l.id) === label) || { name: 'Etiqueta', _id: label }
                  )}
                  onLabelSelect={handleAddLabel}
                  onLabelRemove={handleRemoveLabel}
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={t('edit.public')}
                name="isPublic"
                id="photo-public-switch"
                checked={editForm.isPublic}
                onChange={handleFormChange}
              />
              <Form.Text className="text-muted">
                {t('edit.public_description')}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('edit.coordinates')}</Form.Label>
              <Form.Control
                type="text"
                name="coordinates"
                value={editForm.coordinates}
                onChange={handleFormChange}
                placeholder={t('edit.coordinates_placeholder')}
              />
              <Form.Text className="text-muted">
                {t('edit.coordinates_help')}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t('edit.saving')}
              </>
            ) : t('edit.save_changes')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal del editor de imagen */}
      <Modal
        show={showImageEditor}
        onHide={() => setShowImageEditor(false)}
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('photos:image_editor.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SimpleImageEditor
            imageUrl={photo?.originalUrl}
            initialTransformations={imageTransformations}
            edited={photo?.edited || false}
            onSave={handleSaveImageTransformations}
          />
        </Modal.Body>
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
          <strong className="me-auto">{t('toast.title')}</strong>
          <small>{t('toast.now')}</small>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-label-item:active,
          .custom-label-item.active {
            background-color: transparent !important;
            color: inherit !important;
          }
        `
      }} />
    </Container>
  );
};

export default PhotoDetail; 