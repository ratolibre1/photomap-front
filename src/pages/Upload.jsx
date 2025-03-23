import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Alert, ProgressBar, Form, Spinner, Dropdown } from 'react-bootstrap';
import UploadPhotos from '../components/upload/UploadPhotos';
import UploadZip from '../components/upload/UploadZip';
import { useDropzone } from 'react-dropzone';
import { photoService, categoryService } from '../services/api';
import { useLabels } from '../context/LabelContext';
import LabelBadge from '../components/common/LabelBadge';

const Upload = () => {
  const [activeTab, setActiveTab] = useState('photos');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Estado para archivos
  const [files, setFiles] = useState([]);

  // Estado para los datos del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [visibility, setVisibility] = useState('public');

  // Estado para categorías disponibles
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const { categoriesWithLabels, loading: labelsLoading } = useLabels();

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError(null);

        const response = await categoryService.getCategories();
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategoriesError('No se pudieron cargar las categorías. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Configuración de dropzone para subida de archivos
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: acceptedFiles => {
      const newFiles = acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(2),
        })
      );
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  });

  // Eliminar archivo de la lista
  const removeFile = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  // Funciones para manejar etiquetas
  const handleAddLabel = (label) => {
    if (!selectedLabels.some(item => (item._id || item.id) === (label._id || label.id))) {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setSelectedLabels(selectedLabels.filter(label =>
      (label._id || label.id) !== (labelToRemove._id || labelToRemove.id)
    ));
  };

  // Enviar archivos al servidor
  const handleUpload = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setUploadError('Por favor, selecciona al menos una foto para subir.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(false);

      // Subir cada archivo individualmente
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('title', title || file.name);
        formData.append('description', description || '');

        // Añadir etiquetas
        selectedLabels.forEach(label => {
          formData.append('labels[]', label._id || label.id);
        });

        // Añadir visibilidad
        formData.append('visibility', visibility);

        // Configurar el tracking de progreso para este archivo
        setUploadProgress(prev => ({
          ...prev,
          [file.id]: 0
        }));

        try {
          await photoService.uploadPhoto(formData, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(prev => ({
                ...prev,
                [file.id]: percentCompleted
              }));
            }
          });

          return { id: file.id, success: true };
        } catch (error) {
          console.error(`Error al subir ${file.name}:`, error);
          return { id: file.id, success: false, error };
        }
      });

      const results = await Promise.all(uploadPromises);
      const allSuccess = results.every(result => result.success);

      if (allSuccess) {
        setUploadSuccess(true);
        setFiles([]);
        setTitle('');
        setDescription('');
        setSelectedLabels([]);
      } else {
        setUploadError('Hubo problemas al subir algunas imágenes. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error durante la subida de fotos:', error);
      setUploadError('Error al subir las imágenes. Por favor, verifica tu conexión e intenta de nuevo.');
    } finally {
      setUploading(false);
      // Limpiar progreso después de un tiempo
      setTimeout(() => {
        setUploadProgress({});
      }, 3000);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Subir Fotos</h1>

      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <Nav variant="tabs" className="flex-row">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'photos'}
                onClick={() => setActiveTab('photos')}
                className="text-decoration-none"
              >
                📷 Fotos Individuales
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'zip'}
                onClick={() => setActiveTab('zip')}
                className="text-decoration-none"
              >
                📁 Archivo ZIP
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {uploadSuccess && (
            <Alert variant="success" className="mb-3">
              ¡Archivos subidos correctamente!
            </Alert>
          )}

          {uploadError && (
            <Alert variant="danger" className="mb-3">
              {uploadError}
            </Alert>
          )}

          {uploading && (
            <div className="mb-3">
              <p className="text-muted">Subiendo archivos...</p>
              <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} />
            </div>
          )}

          {activeTab === 'photos' ? (
            <Form onSubmit={handleUpload}>
              <Row>
                <Col lg={8}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Selecciona las fotos a subir</h5>

                      {/* Zona de arrastrar y soltar */}
                      <div {...getRootProps({ className: 'dropzone' })}>
                        <input {...getInputProps()} />
                        <div className="text-center py-5">
                          <i className="bi bi-cloud-arrow-up display-3"></i>
                          <p className="mt-3">Arrastra y suelta tus fotos aquí, o haz clic para seleccionarlas</p>
                          <small className="text-muted">Formatos aceptados: JPG, JPEG, PNG, GIF</small>
                        </div>
                      </div>

                      {/* Previsualización de archivos */}
                      {files.length > 0 && (
                        <div className="mt-4">
                          <h6>{files.length} foto(s) seleccionada(s)</h6>
                          <Row xs={2} md={3} lg={4} className="g-3 mt-2">
                            {files.map(file => (
                              <Col key={file.id}>
                                <Card className="h-100">
                                  <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                                    <img
                                      src={file.preview}
                                      alt={file.name}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    {uploadProgress[file.id] > 0 && uploadProgress[file.id] < 100 && (
                                      <div className="upload-progress">
                                        <div
                                          className="progress-bar"
                                          style={{ width: `${uploadProgress[file.id]}%` }}
                                        ></div>
                                        <span className="progress-text">{uploadProgress[file.id]}%</span>
                                      </div>
                                    )}
                                  </div>
                                  <Card.Body className="p-2">
                                    <small className="d-block text-truncate">{file.name}</small>
                                    <small className="text-muted">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </small>
                                  </Card.Body>
                                  <Button
                                    variant="link"
                                    className="position-absolute top-0 end-0 text-danger"
                                    onClick={() => removeFile(file.id)}
                                    disabled={uploading}
                                  >
                                    <i className="bi bi-x-circle"></i>
                                  </Button>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Detalles de las fotos</h5>

                      <Form.Group className="mb-3">
                        <Form.Label>Título (opcional)</Form.Label>
                        <Form.Control
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Agrega un título para todas las fotos"
                          disabled={uploading}
                        />
                        <Form.Text className="text-muted">
                          Se usará el nombre del archivo si no se especifica un título.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Descripción (opcional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Agrega una descripción"
                          disabled={uploading}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Etiquetas</Form.Label>

                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {selectedLabels.length > 0 ? (
                            selectedLabels.map(label => (
                              <LabelBadge
                                key={label._id || label.id}
                                label={label}
                                showEditButton={false}
                                onDelete={handleRemoveLabel}
                              />
                            ))
                          ) : (
                            <span className="text-muted">Ninguna etiqueta seleccionada</span>
                          )}
                        </div>

                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" id="label-dropdown" className="mt-2">
                            <i className="bi bi-tag me-1"></i> Agregar etiqueta
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {labelsLoading ? (
                              <Dropdown.Item disabled>Cargando etiquetas...</Dropdown.Item>
                            ) : (
                              categoriesWithLabels.map(category => (
                                <div key={category._id || category.id}>
                                  <Dropdown.Header>{category.name}</Dropdown.Header>
                                  {category.labels?.map(label => {
                                    const isSelected = selectedLabels.some(selected =>
                                      (selected._id || selected.id) === (label._id || label.id)
                                    );

                                    return (
                                      <Dropdown.Item
                                        key={label._id || label.id}
                                        onClick={() => handleAddLabel(label)}
                                        disabled={isSelected}
                                      >
                                        <LabelBadge
                                          label={label}
                                          showEditButton={false}
                                          disabled={isSelected}
                                        />
                                      </Dropdown.Item>
                                    );
                                  })}
                                  <Dropdown.Divider />
                                </div>
                              ))
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Visibilidad</Form.Label>
                        <div>
                          <Form.Check
                            type="radio"
                            name="visibility"
                            id="visibility-public"
                            label="Pública"
                            value="public"
                            checked={visibility === 'public'}
                            onChange={() => setVisibility('public')}
                            disabled={uploading}
                          />
                          <Form.Check
                            type="radio"
                            name="visibility"
                            id="visibility-private"
                            label="Privada"
                            value="private"
                            checked={visibility === 'private'}
                            onChange={() => setVisibility('private')}
                            disabled={uploading}
                          />
                        </div>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 mt-3"
                        disabled={uploading || files.length === 0}
                      >
                        {uploading ? (
                          <>
                            <Spinner size="sm" animation="border" className="me-2" />
                            Subiendo...
                          </>
                        ) : (
                          <>Subir {files.length} foto{files.length !== 1 && 's'}</>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form>
          ) : (
            <UploadZip onUpload={handleUpload} isUploading={uploading} />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Upload;
