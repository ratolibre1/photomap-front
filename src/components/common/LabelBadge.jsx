import React from 'react';
import { useTranslation } from 'react-i18next';

const LabelBadge = ({ label, onEdit, onDelete, showEditButton = true, disabled = false, preview = false, showPhotoCount = false }) => {
  const bgColor = label.color || '#000000';
  const txtColor = label.textColor || '#ffffff';
  const { t } = useTranslation(['labels']);

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: txtColor,
        borderRadius: '50px',
        padding: '5px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 6px 6px 0',
        fontWeight: preview ? 'bold' : 'bold',
        fontSize: '0.85rem',
        opacity: disabled ? 0.7 : 1,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          textDecoration: disabled ? 'line-through' : 'none',
          fontWeight: preview ? '900' : 'bold',
          display: 'flex',
          alignItems: 'center',
          lineHeight: 1.2,
        }}
      >
        {label.name}
        {showPhotoCount && label.publicPhotoCount !== undefined && label.publicPhotoCount > 0 && (
          <span
            style={{
              marginLeft: '6px',
              fontSize: '0.7rem',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              padding: '2px 6px',
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
            title={t('photo_count', { count: label.publicPhotoCount })}
          >
            <i className="bi bi-camera me-1" style={{ fontSize: '0.65rem' }}></i>
            {label.publicPhotoCount}
          </span>
        )}
      </span>
      {showEditButton && onEdit && !disabled && (
        <button
          style={{
            background: 'none',
            border: 'none',
            color: txtColor,
            padding: '0 0 0 4px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
          onClick={() => onEdit(label)}
          title={t('buttons.edit')}
        >
          <i className="bi bi-pencil-fill"></i>
        </button>
      )}
      {onDelete && !disabled && (
        <button
          style={{
            background: 'none',
            border: 'none',
            color: txtColor,
            padding: '0 0 0 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
          onClick={() => onDelete(label)}
          title={t('buttons.delete')}
        >
          <i className="bi bi-x-circle"></i>
        </button>
      )}
    </div>
  );
};

export default LabelBadge; 