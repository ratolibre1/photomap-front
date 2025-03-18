import { useState, useRef } from 'react';
import { Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';

const UploadPhotos = ({ onUpload, isUploading }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  // Lista mock de categorías (esto se podría obtener de una API)
  const categories = [
    { id: 1, name: 'Paisajes' },
    { id: 2, name: 'Ciudad' },
    { id: 3, name: 'Personas' },
    { id: 4, name: 'Naturaleza' },
    { id: 5, name: 'Arquitectura' }
  ];

  // Configurar dropzone para arrastrar y soltar archivos
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: acceptedFiles => {
      const newFiles = acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  });

  // Eliminar un archivo seleccionado
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  // Enviar el formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    const metadata = {
      title,
      description,
      category,
      location
    };

    onUpload(selectedFiles, metadata);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <div
            {...getRootProps()}
            className={`upload-dropzone p-5 mb-3 text-center border rounded ${isDragActive ? 'border-primary bg-light' : 'border-dashed'}`}
            style={{
              borderStyle: 'dashed',
              cursor: 'pointer',
              transition: 'border 0.2s, background-color 0.2s'
            }}
          >
            <input {...getInputProps()} />
            <div className="py-4">
              <i className="bi bi-cloud-upload fs-1 mb-2 text-primary"></i>
              <p className="mb-0">
                {isDragActive ?
                  '¡Suelta las imágenes aquí!' :
                  'Arrastra y suelta imágenes aquí, o haz clic para seleccionar'
                }
              </p>
              <p className="text-muted small mt-2">Formatos aceptados: JPG, PNG, GIF</p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mb-3">
              <h5>Archivos seleccionados ({selectedFiles.length})</h5>
              <div className="selected-files mt-3 p-3 border rounded bg-light">
                <Row xs={3} md={4} className="g-2">
                  {selectedFiles.map((file, index) => (
                    <Col key={index}>
                      <div className="preview-container position-relative">
                        <img
                          src={file.preview}
                          alt={`Preview ${index}`}
                          className="img-thumbnail"
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          onLoad={() => { URL.revokeObjectURL(file.preview) }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 rounded-circle p-0 m-1"
                          style={{ width: '20px', height: '20px', fontSize: '10px', lineHeight: '1' }}
                          onClick={() => removeFile(index)}
                        >
                          ×
                        </Button>
                        <small className="d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                          {file.name}
                        </small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          )}
        </Col>

        <Col md={6}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <h5>Información adicional</h5>
              <hr />

              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título para todas las fotos"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de las fotos"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ubicación</Form.Label>
                <Form.Control
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Santiago, Chile"
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={selectedFiles.length === 0 || isUploading}
          className="px-4"
        >
          {isUploading ? 'Subiendo...' : `Subir ${selectedFiles.length} ${selectedFiles.length === 1 ? 'foto' : 'fotos'}`}
        </Button>
      </div>
    </Form>
  );
};

export default UploadPhotos; 