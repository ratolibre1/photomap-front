import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ColorPalette = () => {
  const { themeData } = useTheme();
  const { t } = useTranslation(['admin']);

  // Usar directamente los colores del themeData en lugar de leerlos del CSS
  const colors = themeData.colors;

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{t('colors.title')}</h5>
        <Badge bg="primary" className="ms-2">
          {themeData.icon} {themeData.name}
        </Badge>
      </Card.Header>
      <ListGroup variant="flush">
        {Object.entries(colors).map(([name, value]) => (
          <ListGroup.Item key={name} className="d-flex align-items-center">
            <div
              className="color-swatch me-3"
              style={{
                backgroundColor: value,
                width: '30px',
                height: '30px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
            <div>
              <strong>--{name}</strong>
              <div className="text-muted small">{value}</div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Card.Footer className="text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        {t('colors.footer', { name: themeData.name })}
      </Card.Footer>
    </Card>
  );
};

export default ColorPalette; 