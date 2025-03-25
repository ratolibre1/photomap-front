import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { useLabels } from '../../context/LabelContext';
import LabelBadge from './LabelBadge';
import { useTranslation } from 'react-i18next';

const LabelSelector = ({ selectedLabels = [], onLabelSelect, onLabelRemove, showPhotoCount = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation(['labels', 'common']);
  const { categoriesWithLabels, loading: labelsLoading } = useLabels();

  // Filtrar categorías que tienen etiquetas
  const categoriesWithValidLabels = categoriesWithLabels.filter(category =>
    Array.isArray(category.labels) && category.labels.length > 0
  );

  return (
    <div>
      {/* Mostrar etiquetas seleccionadas */}
      <div className="d-flex flex-wrap gap-2 mb-2">
        {selectedLabels.length === 0 ? (
          <span className="text-muted fst-italic">{t('dropdown.none_selected')}</span>
        ) : (
          selectedLabels.map(label => (
            <LabelBadge
              key={label._id || label.id}
              label={label}
              showEditButton={false}
              onDelete={() => onLabelRemove(label)}
              showPhotoCount={showPhotoCount}
            />
          ))
        )}
      </div>

      {/* Dropdown para seleccionar etiquetas */}
      <Dropdown
        show={dropdownOpen}
        onToggle={(isOpen) => {
          console.log("Dropdown toggle:", isOpen);
          setDropdownOpen(isOpen);
        }}
        autoClose={false}
        style={{ zIndex: 9999 }}
      >
        <Dropdown.Toggle variant="outline-secondary" size="sm" id="label-dropdown">
          <i className="bi bi-tag me-1"></i> {t('dropdown.select')}
        </Dropdown.Toggle>
        <Dropdown.Menu
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 9999 // Valor superior al de los controles de Leaflet
          }}
        >
          {labelsLoading ? (
            <Dropdown.Item disabled>{t('dropdown.loading')}</Dropdown.Item>
          ) : categoriesWithValidLabels.length > 0 ? (
            categoriesWithValidLabels.map(category => (
              <div key={category._id || category.id}>
                <Dropdown.Header>{category.name}</Dropdown.Header>
                {category.labels.map(label => {
                  const isSelected = selectedLabels.some(selected =>
                    (selected._id || selected.id) === (label._id || label.id)
                  );

                  return (
                    <div
                      key={label._id || label.id}
                      onClick={() => {
                        console.log("Clic en etiqueta:", label.name);
                        if (!isSelected) onLabelSelect(label);
                      }}
                      className={`dropdown-item custom-label-item ${isSelected ? 'disabled' : ''}`}
                      style={{
                        cursor: isSelected ? 'not-allowed' : 'pointer',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        opacity: isSelected ? 0.65 : 1,
                        outline: 'none'
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      tabIndex="-1"
                    >
                      <LabelBadge
                        label={label}
                        showEditButton={false}
                        disabled={isSelected}
                        showPhotoCount={showPhotoCount}
                      />
                    </div>
                  );
                })}
                <Dropdown.Divider />
              </div>
            ))
          ) : (
            <Dropdown.Item disabled>{t('dropdown.no_labels')}</Dropdown.Item>
          )}

          <div className="d-grid gap-2 px-2 mt-2 mb-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setDropdownOpen(false)}
            >
              <i className="bi bi-check2-all me-1"></i> {t('common:buttons.close')}
            </Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>

      {/* Estilo para evitar el highlight azul al hacer clic */}
      <style jsx>{`
        .custom-label-item:active,
        .custom-label-item.active {
          background-color: transparent !important;
          color: inherit !important;
        }
      `}</style>
    </div>
  );
};

export default LabelSelector; 