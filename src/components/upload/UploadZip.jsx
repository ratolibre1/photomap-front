import React, { useState, useRef } from 'react';
import { Card, Form, Button, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { photoService } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { FILE_UPLOAD_CONFIG } from '../../config';

const UploadZip = () => {
  const { t } = useTranslation(['upload', 'common']);
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
      setError(t('zip.error.invalid_file'));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError(t('zip.error.no_file'));
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(false);

      await photoService.uploadPhotoZip(file, {
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
      setError(t('zip.error.upload_failed', { message: err.message || t('zip.error.try_again') }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-3">{t('zip.title')}</h4>

        <p className="text-muted">
          {t('zip.description')}
        </p>

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
            <Alert.Heading>{t('zip.success')}</Alert.Heading>
            {t('zip.success_message')}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>{t('zip.file_label')}</Form.Label>
          <Form.Control
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            disabled={uploading}
            ref={fileInputRef}
          />
          <Form.Text className="text-muted">
            {t('zip.help_text')}
            {FILE_UPLOAD_CONFIG.maxZipSize && (
              <span> {t('zip.max_size', { size: FILE_UPLOAD_CONFIG.maxZipSize / (1024 * 1024) })}</span>
            )}
          </Form.Text>
        </Form.Group>

        {file && (
          <div className="mb-3">
            <strong>{t('zip.file_selected')}</strong> {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
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
              <small>{t('zip.processing')}</small>
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

export default UploadZip; 