import React, { useState, useRef } from 'react';
import { Card, Form, Button, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { photoService } from '../../services/api';

const UploadZip = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/zip') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Por favor selecciona un archivo ZIP válido');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo ZIP para subir');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(false);

      await photoService.uploadTakeoutZip(file, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error al subir archivo ZIP:', err);
      setError(`Error al subir archivo: ${err.message || 'Intenta nuevamente más tarde'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-3">Importar fotos desde archivo ZIP</h4>

        <p className="text-muted">
          Sube un archivo ZIP con tus fotos para importarlas de forma masiva.
        </p>

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
            <Alert.Heading>¡Éxito! 🎉</Alert.Heading>
            El archivo ZIP se ha subido correctamente y está siendo procesado.
            Las fotos aparecerán en tu galería cuando el procesamiento termine.
          </Alert>
        )}

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Archivo ZIP</Form.Label>
          <Form.Control
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            disabled={uploading}
            ref={fileInputRef}
          />
          <Form.Text className="text-muted">
            Selecciona un archivo ZIP que contenga tus fotos
          </Form.Text>
        </Form.Group>

        {file && (
          <div className="mb-3">
            <strong>Archivo seleccionado:</strong> {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </div>
        )}

        {uploading && (
          <div className="mb-3">
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              variant="primary"
              animated
            />
            <div className="text-center mt-2 text-muted">
              <small>Este proceso puede tardar varios minutos dependiendo del tamaño del archivo</small>
            </div>
          </div>
        )}

        <div className="d-grid">
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Subiendo...
              </>
            ) : (
              <>
                <i className="bi bi-cloud-upload me-2"></i>
                Importar Fotos
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UploadZip; 