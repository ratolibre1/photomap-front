import React, { useState } from 'react';
import { Dropdown, Button, Spinner } from 'react-bootstrap';
import { useLabels } from '../../context/LabelContext';
import LabelBadge from './LabelBadge';

const LabelSelector = ({ selectedLabels = [], onLabelSelect, onLabelRemove, showPhotoCount = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { categoriesWithLabels, loading: labelsLoading } = useLabels();

  // Filtrar categorías para mostrar solo las que tienen etiquetas
  const categoriesWithValidLabels = categoriesWithLabels
    .filter(category => category.labels && category.labels.length > 0);

  console.log("LabelSelector renderizado con:", {
    selectedLabels,
    categoriesWithLabels: categoriesWithLabels?.length || 0,
    filteredCategories: categoriesWithValidLabels.length,
    dropdownOpen
  });

  return (
    <div>
      {/* Mostrar etiquetas seleccionadas */}
      <div className="d-flex flex-wrap gap-2 mb-2">
        {selectedLabels.length === 0 ? (
          <span className="text-muted fst-italic">Sin etiquetas seleccionadas</span>
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
          <i className="bi bi-tag me-1"></i> Seleccionar etiquetas
        </Dropdown.Toggle>
        <Dropdown.Menu
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 9999 // Valor superior al de los controles de Leaflet
          }}
        >
          {labelsLoading ? (
            <Dropdown.Item disabled>Cargando etiquetas...</Dropdown.Item>
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
            <Dropdown.Item disabled>No hay categorías con etiquetas disponibles</Dropdown.Item>
          )}

          <div className="d-grid gap-2 px-2 mt-2 mb-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setDropdownOpen(false)}
            >
              <i className="bi bi-check2-all me-1"></i> Listo
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