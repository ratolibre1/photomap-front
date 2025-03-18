import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Spinner, Alert, Modal } from 'react-bootstrap';
import { categoryService } from '../services/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Cargar categorías al iniciar
  useEffect(() => {
    loadCategories();
  }, []);

  // Función para cargar las categorías
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      console.log('Categorías cargadas:', response.data);
      setCategories(response.data.data.categories || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('No se pudieron cargar las categorías. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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

      if (isEditing) {
        // Actualizar categoría existente
        await categoryService.updateCategory(currentCategory._id, currentCategory);
      } else {
        // Crear nueva categoría
        await categoryService.createCategory(currentCategory);
      }

      // Recargar la lista de categorías
      await loadCategories();

      // Cerrar el modal
      setShowModal(false);
      setCurrentCategory({ name: '', description: '' });

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
      await categoryService.deleteCategory(categoryId);

      // Recargar categorías
      await loadCategories();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      setError('No se pudo eliminar la categoría. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Administrar Categorías</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleNewCategory}
            disabled={loading}
          >
            <i className="bi bi-plus-circle me-2"></i>Nueva Categoría
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          {loading && !showModal ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-2">Cargando categorías...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No hay categorías definidas todavía</p>
              <Button variant="outline-primary" onClick={handleNewCategory}>
                Crear primera categoría
              </Button>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Nombre</th>
                  <th style={{ width: '40%' }}>Descripción</th>
                  <th style={{ width: '20%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description || <span className="text-muted">Sin descripción</span>}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditCategory(category)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteConfirm(category._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal para crear/editar categoría */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre de la categoría"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descripción (opcional)"
                value={currentCategory.description || ''}
                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveCategory}
            disabled={!currentCategory.name || loading}
          >
            {loading ? (
              <>
                <Spinner as="span" size="sm" animation="border" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres eliminar esta categoría?</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteCategory(deleteConfirm)}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryManager; 