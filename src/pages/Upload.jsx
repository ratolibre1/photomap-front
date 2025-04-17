import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Alert, ProgressBar, Form, Spinner } from 'react-bootstrap';
import UploadPhotos from '../components/upload/UploadPhotos';
import UploadZip from '../components/upload/UploadZip';
import { useDropzone } from 'react-dropzone';
import { photoService } from '../services/api';
import LabelSelector from '../components/common/LabelSelector';
import { useTranslation } from 'react-i18next';
import { DropdownProvider } from '../context/DropdownContext';

const Upload = () => {
  const { t } = useTranslation(['upload', 'common']);
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
  const [isPublic, setIsPublic] = useState(true);

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
  const handleLabelSelect = (label) => {
    if (!selectedLabels.some(item => (item._id || item.id) === (label._id || label.id))) {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleLabelRemove = (labelToRemove) => {
    setSelectedLabels(selectedLabels.filter(label =>
      (label._id || label.id) !== (labelToRemove._id || labelToRemove.id)
    ));
  };

  // Enviar archivos al servidor
  const handleUpload = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setUploadError(t('error.no_files'));
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
        formData.append('isPublic', isPublic);

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
        setUploadError(t('error.partial_upload'));
      }
    } catch (error) {
      console.error('Error durante la subida de fotos:', error);
      setUploadError(t('error.upload_failed'));
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
      <h1 className="mb-4">{t('title')}</h1>

      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <Nav variant="tabs" className="flex-row">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'photos'}
                onClick={() => setActiveTab('photos')}
                className="text-decoration-none"
              >
                <i className="bi bi-camera-fill"></i> {t('tabs.photos')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'zip'}
                onClick={() => setActiveTab('zip')}
                className="text-decoration-none"
              >
                <i className="bi bi-file-earmark-zip-fill"></i> {t('tabs.zip')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {uploadSuccess && (
            <Alert variant="success" className="mb-3">
              {t('common:success.uploaded')}
            </Alert>
          )}

          {uploadError && (
            <Alert variant="danger" className="mb-3">
              {uploadError}
            </Alert>
          )}

          {uploading && (
            <div className="mb-3">
              <p className="text-muted">{t('progress.uploading')}</p>
              <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} />
            </div>
          )}

          {activeTab === 'photos' ? (
            <Form onSubmit={handleUpload}>
              <Row>
                <Col lg={8}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">{t('dropzone.title')}</h5>

                      {/* Zona de arrastrar y soltar */}
                      <div {...getRootProps({ className: 'dropzone' })}>
                        <input {...getInputProps()} />
                        <div className="text-center py-5">
                          <i className="bi bi-cloud-arrow-up display-3"></i>
                          <p className="mt-3">
                            {t('dropzone.subtitle')}
                          </p>
                          <small className="text-muted">
                            {t('dropzone.formats')}
                          </small>
                        </div>
                      </div>

                      {/* Previsualización de archivos */}
                      {files.length > 0 && (
                        <div className="mt-4">
                          <h6>{t('preview.count', { count: files.length })}</h6>
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
                                  <Card.Footer className="p-2 d-flex justify-content-between align-items-center bg-light">
                                    <small className="text-truncate" style={{ maxWidth: '70%' }}>{file.name}</small>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => removeFile(file.id)}
                                      className="py-0 px-1"
                                    >
                                      <i className="bi bi-x"></i>
                                    </Button>
                                  </Card.Footer>
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
                      <h5 className="mb-3">{t('details.title')}</h5>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('form.title')}</Form.Label>
                        <Form.Control
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={t('form.title_placeholder')}
                        />
                        <Form.Text className="text-muted">
                          {t('form.title_help')}
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('form.description')}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder={t('form.description_placeholder')}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('form.labels')}</Form.Label>
                        <DropdownProvider>
                          <LabelSelector
                            selectedLabels={selectedLabels}
                            onLabelSelect={handleLabelSelect}
                            onLabelRemove={handleLabelRemove}
                          />
                        </DropdownProvider>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('visibility.title')}</Form.Label>
                        <div>
                          <Form.Check
                            type="radio"
                            id="visibility-public"
                            name="isPublic"
                            label={t('visibility.public')}
                            checked={isPublic}
                            onChange={() => setIsPublic(true)}
                            className="mb-2"
                          />
                          <Form.Check
                            type="radio"
                            id="visibility-private"
                            name="isPublic"
                            label={t('visibility.private')}
                            checked={!isPublic}
                            onChange={() => setIsPublic(false)}
                          />
                        </div>
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={files.length === 0 || uploading}
                    >
                      {uploading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          {t('buttons.uploading')}
                        </>
                      ) : (
                        <>{t('buttons.upload', { count: files.length })}</>
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          ) : (
            <UploadZip />
          )}
        </Card.Body>
      </Card>

      <style jsx="true">{`
        .dropzone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dropzone:hover, .dropzone:focus {
          border-color: var(--bs-primary);
          background-color: rgba(13, 110, 253, 0.05);
        }
        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 24px;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: rgba(13, 110, 253, 0.7);
          z-index: 1;
        }
        .progress-text {
          color: white;
          font-size: 12px;
          position: relative;
          z-index: 2;
          text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </Container>
  );
};

export default Upload;
