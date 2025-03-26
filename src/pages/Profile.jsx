import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Tab, Nav, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const { t } = useTranslation(['profile', 'common']);

  // Estados para el formulario de información personal
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
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
      // Aquí iría la llamada a la API para actualizar el perfil
      // Por ahora simulamos éxito
      setTimeout(() => {
        console.log('Guardando:', userInfo);
        setSuccess(t('personal_info.success'));
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error al actualizar la información:', err);
      setError(t('personal_info.error'));
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
      // Aquí iría la llamada a la API para cambiar la contraseña
      // Por ahora simulamos éxito
      setTimeout(() => {
        console.log('Cambiando contraseña');
        setSuccess(t('password.success'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      setError(t('password.error'));
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">{t('title')}</h1>

      <Row>
        <Col lg={3} md={4} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <h5>{user?.name || t('avatar.default_user')}</h5>
              <p className="text-muted small">{user?.email || t('avatar.default_email')}</p>

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
                      <Col md={6}>
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
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('personal_info.email')}</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={userInfo.email}
                            onChange={handleInfoChange}
                            required
                            disabled
                          />
                          <Form.Text className="text-muted">
                            {t('personal_info.email_help')}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('personal_info.bio')}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="bio"
                        value={userInfo.bio}
                        onChange={handleInfoChange}
                        placeholder={t('personal_info.bio_placeholder')}
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