import { useState, useRef } from 'react';
import { Card, Form, Button, Row, Col, Alert, Tab, Nav, Container, Image } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/api';

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const { t } = useTranslation(['profile', 'common']);
  const fileInputRef = useRef(null);

  // Estados para el formulario de información personal
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    biography: user?.biography || ''
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para control de formularios
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);

  // Manejar cambios en el formulario de info
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar información personal
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Llamada a la API para actualizar el perfil
      const response = await authService.updateProfile({
        name: userInfo.name,
        biography: userInfo.biography
      });

      console.log('Perfil actualizado:', response.data);

      // Actualizar los datos del usuario en el contexto
      if (response.data && response.data.data && response.data.data.user) {
        updateUserData(response.data.data.user);
      }

      setSuccess(t('personal_info.success'));
    } catch (err) {
      console.error('Error al actualizar la información:', err);
      setError(err.response?.data?.message || t('personal_info.error'));
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar que las contraseñas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('password.mismatch'));
      return;
    }

    setLoading(true);
    try {
      // Llamada a la API para cambiar la contraseña
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess(t('password.success'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      setError(err.response?.data?.message || t('password.error'));
    } finally {
      setLoading(false);
    }
  };

  // Abrir selector de archivos
  const handlePhotoButtonClick = () => {
    fileInputRef.current.click();
  };

  // Subir/actualizar foto de perfil
  const handleProfilePhotoChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setError('');
    setSuccess('');
    setPhotoLoading(true);

    try {
      const response = await authService.updateProfilePhoto(file);

      // Actualizar los datos del usuario en el contexto
      if (response.data && response.data.data && response.data.data.user) {
        updateUserData(response.data.data.user);
      }

      setSuccess(t('photo.upload_success'));
    } catch (err) {
      console.error('Error al actualizar la foto:', err);
      setError(err.response?.data?.message || t('photo.upload_error'));
    } finally {
      setPhotoLoading(false);
      // Limpiar el input de archivo para permitir seleccionar el mismo archivo nuevamente
      e.target.value = null;
    }
  };

  // Eliminar foto de perfil
  const handleDeletePhoto = async () => {
    if (!window.confirm(t('photo.confirm_delete'))) return;

    setError('');
    setSuccess('');
    setPhotoLoading(true);

    try {
      const response = await authService.deleteProfilePhoto();

      // Actualizar los datos del usuario en el contexto
      if (response.data && response.data.data && response.data.data.user) {
        updateUserData(response.data.data.user);
      }

      setSuccess(t('photo.delete_success'));
    } catch (err) {
      console.error('Error al eliminar la foto:', err);
      setError(err.response?.data?.message || t('photo.delete_error'));
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">{t('title')}</h1>

      <Row>
        <Col lg={3} md={4} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body>
              {user?.profilePhoto?.url ? (
                <div className="position-relative mb-3">
                  <Image
                    src={user.profilePhoto.url}
                    alt={user.name}
                    roundedCircle
                    className="profile-photo mx-auto d-block"
                    style={{ width: '160px', height: '160px', objectFit: 'cover', objectPosition: 'center' }}
                  />
                  {photoLoading && (
                    <div className="position-absolute top-0 start-50 translate-middle-x"
                      style={{ width: '160px', height: '160px' }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '160px', height: '160px', fontSize: '4rem' }}>
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}

              <h5>{user?.name || t('avatar.default_user')}</h5>
              <p className="text-muted small">{user?.email || t('avatar.default_email')}</p>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePhotoChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handlePhotoButtonClick}
                  disabled={photoLoading}
                >
                  <i className="bi bi-upload me-1"></i> {t('photo.upload')}
                </Button>
                {user?.profilePhoto?.url && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDeletePhoto}
                    disabled={photoLoading}
                  >
                    <i className="bi bi-trash me-1"></i> {t('photo.delete')}
                  </Button>
                )}
              </div>

              <Nav variant="pills" className="flex-column mt-4" onSelect={(key) => setActiveTab(key)}>
                <Nav.Item>
                  <Nav.Link eventKey="info" className={activeTab === 'info' ? 'active' : ''}>
                    <i className="bi bi-person me-2"></i> {t('nav.personal_info')}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security" className={activeTab === 'security' ? 'active' : ''}>
                    <i className="bi bi-shield-lock me-2"></i> {t('nav.security')}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Tab.Content>
                <Tab.Pane active={activeTab === 'info'}>
                  <h3 className="mb-4">{t('personal_info.title')}</h3>
                  <Form onSubmit={handleSaveInfo}>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('personal_info.name')}</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={userInfo.name}
                            onChange={handleInfoChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('personal_info.biography')}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="biography"
                        value={userInfo.biography}
                        onChange={handleInfoChange}
                        placeholder={t('personal_info.biography_placeholder')}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? t('personal_info.saving') : t('personal_info.save_button')}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>

                <Tab.Pane active={activeTab === 'security'}>
                  <h3 className="mb-4">{t('password.title')}</h3>
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('password.current')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('password.new')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                      <Form.Text className="text-muted">
                        {t('password.requirements')}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('password.confirm')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? t('password.saving') : t('password.save_button')}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 