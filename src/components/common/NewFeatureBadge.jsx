import React from 'react';
import { useTranslation } from 'react-i18next';
import './NewFeatureBadge.css';

/**
 * Componente para mostrar un badge llamativo que indica que una característica es nueva
 * @param {Object} props
 * @param {string} props.position - Posición del badge: 'top-right', 'top-left', 'inline' (por defecto)
 * @param {string} props.size - Tamaño del badge: 'sm', 'md' (por defecto), 'lg'
 * @param {number} props.rotate - Grados de rotación (por defecto 0)
 * @param {string} props.className - Clases CSS adicionales
 */
const NewFeatureBadge = ({ position = 'inline', size = 'md', rotate = 0, className = '' }) => {
  const { t } = useTranslation('common');

  // Determinar las clases basadas en la posición
  let positionClass = '';
  switch (position) {
    case 'top-right':
      positionClass = 'new-feature-badge-top-right';
      break;
    case 'top-left':
      positionClass = 'new-feature-badge-top-left';
      break;
    default:
      positionClass = 'new-feature-badge-inline';
  }

  // Determinar las clases basadas en el tamaño
  let sizeClass = '';
  switch (size) {
    case 'sm':
      sizeClass = 'new-feature-badge-sm';
      break;
    case 'lg':
      sizeClass = 'new-feature-badge-lg';
      break;
    default:
      sizeClass = 'new-feature-badge-md';
  }

  return (
    <div
      className={`new-feature-badge ${positionClass} ${sizeClass} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span className="new-feature-badge-text">{t('badges.new')}</span>
      <div className="new-feature-badge-shine"></div>
    </div>
  );
};

export default NewFeatureBadge; 