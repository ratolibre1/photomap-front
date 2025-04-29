import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Nav, Button, Alert, ProgressBar, Form, Spinner } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { photoService } from '../services/api';
import LabelSelector from '../components/common/LabelSelector';
import { useTranslation } from 'react-i18next';
import { DropdownProvider } from '../context/DropdownContext';
import { FILE_UPLOAD_CONFIG } from '../config';
import UploadResultModal from '../components/upload/UploadResultModal';

const Upload = () => {
  const { t } = useTranslation(['upload', 'common']);
  const [activeTab, setActiveTab] = useState('photos');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResult, setUploadResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
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

  // Cerrar el modal de resultados
  const handleCloseResultModal = () => {
    setShowResultModal(false);

    // Si fue éxito, limpiar el formulario
    if (uploadResult && uploadResult.success) {
      setFiles([]);
      setTitle('');
      setDescription('');
      setSelectedLabels([]);
    }
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
      setUploadResult(null);

      // Configurar el seguimiento de progreso global
      const onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        // Actualizar el progreso de todas las fotos (ya que se suben juntas)
        const newProgress = {};
        files.forEach(file => {
          newProgress[file.id] = percentCompleted;
        });

        setUploadProgress(newProgress);
      };

      // Usar el nuevo método para subir todas las fotos de una vez
      const response = await photoService.uploadMultiplePhotos(
        files, // Todos los archivos
        {
          title,
          description,
          labels: selectedLabels,
          isPublic
        },
        { onUploadProgress }
      );

      console.log('Respuesta completa del servidor:', response);

      if (response.data && response.data.status === 'success') {
        try {
          // La respuesta ahora viene en el formato estándar directamente desde el servidor
          // Verificamos que la estructura sea exactamente la que espera el modal
          const responseData = response.data;

          console.log('Datos recibidos del servidor:', JSON.stringify(responseData, null, 2));

          if (!responseData.data || typeof responseData.data !== 'object') {
            throw new Error('La respuesta no contiene el objeto data esperado');
          }

          // Asegurar que el objeto uploadResult tenga la estructura esperada por el modal
          const standardizedResult = {
            success: true,
            data: {
              message: responseData.data.message || 'Procesamiento completado',
              stats: responseData.data.stats || {},
              allDuplicates: responseData.data.allDuplicates
            }
          };

          // Verificar que stats tenga las propiedades necesarias
          if (!standardizedResult.data.stats.photos) {
            standardizedResult.data.stats.photos = [];
          }

          console.log('Setting standardized upload result for modal:', standardizedResult);

          setUploadResult(standardizedResult);
          setShowResultModal(true);

          // Limpiar el formulario tras éxito
          setFiles([]);
          setTitle('');
          setDescription('');
          setSelectedLabels([]);
        } catch (error) {
          console.error('Error al procesar la respuesta:', error);

          // Mostrar error de formato
          setUploadResult({
            success: false,
            error: {
              message: 'Error al procesar la respuesta del servidor: ' + error.message
            }
          });
          setShowResultModal(true);
        }
      } else {
        // Manejar respuesta incorrecta
        setUploadError(response.data?.message || t('error.unexpected_response'));

        // Mostrar modal de error con formato estándar
        setUploadResult({
          success: false,
          error: {
            message: response.data?.message || t('error.unexpected_response')
          }
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error durante la subida de fotos:', error);
      setUploadError(t('error.upload_failed'));

      // Mostrar el modal de error con formato estandarizado
      setUploadResult({
        success: false,
        error: {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.message || t('error.upload_failed')
        }
      });
      setShowResultModal(true);
    } finally {
      setUploading(false);
      // Limpiar progreso después de un tiempo
      setTimeout(() => {
        setUploadProgress({});
      }, 3000);
    }
  };

  // Componente interno para la subida de archivos ZIP
  const ZipUploader = () => {
    const [zipFile, setZipFile] = useState(null);
    const [zipIsPublic, setZipIsPublic] = useState(true);
    const [zipLabels, setZipLabels] = useState([]);
    const [zipUploadProgress, setZipUploadProgress] = useState(0);
    const [zipError, setZipError] = useState(null);
    const [isZipUploading, setIsZipUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile && selectedFile.type === 'application/zip') {
        setZipFile(selectedFile);
        setZipError(null);
      } else {
        setZipFile(null);
        setZipError(t('zip.error.invalid_file'));
      }
    };

    const handleZipLabelSelect = (label) => {
      if (!zipLabels.some(item => (item._id || item.id) === (label._id || label.id))) {
        setZipLabels([...zipLabels, label]);
      }
    };

    const handleZipLabelRemove = (labelToRemove) => {
      setZipLabels(zipLabels.filter(label =>
        (label._id || label.id) !== (labelToRemove._id || labelToRemove.id)
      ));
    };

    const handleZipUpload = async (e) => {
      e.preventDefault();
      if (!zipFile) {
        setZipError(t('upload.select_zip'));
        return;
      }
      setIsZipUploading(true);
      setZipUploadProgress(0);
      setZipError(null);

      try {
        // Usar el servicio específico para subir archivos ZIP
        const response = await photoService.uploadPhotoZip(zipFile, {
          data: {
            isPublic: zipIsPublic,
            labels: zipLabels // Enviamos las etiquetas seleccionadas
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setZipUploadProgress(percentCompleted);
          },
        });

        // Ya no es necesario este bloque porque las etiquetas se envían en la petición principal
        // if (zipLabels && zipLabels.length > 0 && response.data.data?.photos?.length > 0) {
        //   console.log('Las etiquetas seleccionadas deberían aplicarse a las fotos:',
        //     zipLabels.map(label => label._id || label.id));
        // }

        console.log('Respuesta del servidor ZIP:', response.data);

        // Verificar si hay una respuesta válida
        if (response.data && (response.data.status === 'success' || response.data.success === true)) {
          // Obtener los datos de la respuesta directamente
          const responseData = response.data.data || {};

          // IMPORTANTE: Usar las fotos directamente desde la respuesta del servidor
          // sin manipularlas para evitar perder información
          const photosData = responseData.photos || [];

          // Configurar el resultado para mostrar en el modal con estructura estandarizada
          // Preservar la estructura original tanto como sea posible
          const uploadResult = {
            success: true,
            data: {
              // Preservar el mensaje original del servidor si existe
              message: responseData.message || response.data.message,
              // Preservar la marca allDuplicates si existe
              allDuplicates: responseData.allDuplicates,
              // Preservar las estadísticas originales del servidor
              stats: responseData.stats || {}
            }
          };

          // Asegurarse de que las fotos estén presentes en el resultado
          if (photosData && photosData.length > 0) {
            uploadResult.data.stats.photos = photosData;
          }

          console.log('Setting upload result for modal:', uploadResult);

          setUploadResult(uploadResult);
          setShowResultModal(true);

          // Limpiar el estado
          setZipFile(null);
          setZipLabels([]);
          setZipIsPublic(true);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          // Manejar respuesta incorrecta
          setZipError(response.data.message || t('upload.unknown_error'));
          // También podemos mostrar el modal de error con estructura estandarizada
          setUploadResult({
            success: false,
            error: {
              message: response.data.message || t('upload.unknown_error')
            }
          });
          setShowResultModal(true);
        }
      } catch (error) {
        console.error('Error al subir ZIP:', error);

        // Mensaje específico para timeout
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          setZipError(t('zip.error.timeout'));
          // Mostrar el modal de error con estructura estandarizada
          setUploadResult({
            success: false,
            error: {
              statusCode: 408, // Request Timeout
              message: t('zip.error.timeout_message')
            }
          });
        } else {
          // Otros errores
          setZipError(error.response?.data?.message || t('upload.network_error'));
          // Mostrar el modal de error con estructura estandarizada
          setUploadResult({
            success: false,
            error: {
              statusCode: error.response?.status || 500,
              message: error.response?.data?.message || t('upload.network_error')
            }
          });
        }

        setShowResultModal(true);
      } finally {
        setIsZipUploading(false);
      }
    };

    return (
      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="mb-3">{t('zip.title')}</h4>

          <p className="text-muted">
            {t('zip.description')}
          </p>

          {zipError && (
            <Alert variant="danger" dismissible onClose={() => setZipError(null)}>
              {zipError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>{t('zip.file_label')}</Form.Label>
            <Form.Control
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              disabled={isZipUploading}
              ref={fileInputRef}
            />
            <Form.Text className="text-muted">
              {t('zip.help_text')}
              {FILE_UPLOAD_CONFIG.maxZipSize && (
                <span> {t('zip.max_size', { size: FILE_UPLOAD_CONFIG.maxZipSize / (1024 * 1024) })}</span>
              )}
            </Form.Text>
          </Form.Group>

          {zipFile && (
            <div className="mb-3">
              <strong>{t('zip.file_selected')}</strong> {zipFile.name} ({(zipFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>{t('form.labels')}</Form.Label>
            <DropdownProvider>
              <LabelSelector
                onSelect={handleZipLabelSelect}
                selectedLabels={zipLabels}
                onRemove={handleZipLabelRemove}
                disabled={isZipUploading}
                id="zip-labels-selector"
              />
            </DropdownProvider>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('visibility.title')}</Form.Label>
            <div>
              <Form.Check
                type="radio"
                id="zip-visibility-public"
                name="zipIsPublic"
                label={t('visibility.public')}
                checked={zipIsPublic}
                onChange={() => setZipIsPublic(true)}
                className="mb-2"
                disabled={isZipUploading}
              />
              <Form.Check
                type="radio"
                id="zip-visibility-private"
                name="zipIsPublic"
                label={t('visibility.private')}
                checked={!zipIsPublic}
                onChange={() => setZipIsPublic(false)}
                disabled={isZipUploading}
              />
              <Form.Text className="text-muted mt-2">
                {t('visibility.help')}
              </Form.Text>
            </div>
          </Form.Group>

          {isZipUploading && (
            <div className="mb-3">
              <ProgressBar
                now={zipUploadProgress}
                label={`${zipUploadProgress}%`}
                variant="primary"
                animated
              />
              <div className="text-center mt-2 text-muted">
                <small>{t('zip.processing')}</small>
              </div>
            </div>
          )}

          <div className="d-grid">
            <Button
              variant="primary"
              onClick={handleZipUpload}
              disabled={!zipFile || isZipUploading}
            >
              {isZipUploading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('common:buttons.uploading')}
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  {t('zip.upload_button')}
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
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
          {uploadError && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setUploadError(null)}>
              {uploadError}
            </Alert>
          )}

          {uploading && (
            <div className="mb-3">
              <p className="text-muted">{t('progress.uploading')}</p>
              <ProgressBar animated now={Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length} />
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
                      <div {...getRootProps({ className: 'dropzone' })} className="upload-dropzone border border-dashed p-3 rounded">
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
                                <Card className="h-100 preview-container">
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
                                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white">
                                        <div className="text-center">
                                          <div className="spinner-border spinner-border-sm mb-2" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                          </div>
                                          <div>{uploadProgress[file.id]}%</div>
                                        </div>
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
                                      disabled={uploading}
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
                  <Card className="shadow-sm mb-4">
                    <Card.Body>
                      <h5 className="mb-3">{t('details.title')}</h5>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('form.title')}</Form.Label>
                        <Form.Control
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={t('form.title_placeholder')}
                          disabled={uploading}
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
                          disabled={uploading}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('form.labels')}</Form.Label>
                        <DropdownProvider>
                          <LabelSelector
                            onSelect={handleLabelSelect}
                            selectedLabels={selectedLabels}
                            onRemove={handleLabelRemove}
                            disabled={uploading}
                          />
                        </DropdownProvider>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>{t('visibility.title')}</Form.Label>
                        <div>
                          <Form.Check
                            type="radio"
                            id="visibility-public"
                            name="visibility"
                            label={t('visibility.public')}
                            checked={isPublic}
                            onChange={() => setIsPublic(true)}
                            className="mb-2"
                            disabled={uploading}
                          />
                          <Form.Check
                            type="radio"
                            id="visibility-private"
                            name="visibility"
                            label={t('visibility.private')}
                            checked={!isPublic}
                            onChange={() => setIsPublic(false)}
                            disabled={uploading}
                          />
                          <Form.Text className="text-muted mt-2">
                            {t('visibility.help')}
                          </Form.Text>
                        </div>
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={files.length === 0 || uploading}
                        >
                          {uploading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              {t('common:buttons.uploading')}
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cloud-upload me-2"></i>
                              {t('buttons.upload', { count: files.length })}
                            </>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form>
          ) : (
            <ZipUploader />
          )}
        </Card.Body>
      </Card>

      {/* Modal de resultados de carga */}
      <UploadResultModal
        show={showResultModal}
        onHide={handleCloseResultModal}
        result={uploadResult}
      />
    </Container>
  );
};

export default Upload;
