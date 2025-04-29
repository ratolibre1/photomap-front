import React, { useState, useMemo } from 'react';
import { Dropdown, Button, Form, InputGroup } from 'react-bootstrap';
import { useLabels } from '../../context/LabelContext';
import { useDropdown } from '../../context/DropdownContext';
import LabelBadge from './LabelBadge';
import { useTranslation } from 'react-i18next';

const LabelSelector = ({ selectedLabels = [], onLabelSelect, onSelect, onLabelRemove, onRemove, showPhotoCount = false, id = "labels-selector" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation(['labels', 'common', 'filters']);
  const { categoriesWithLabels, loading: labelsLoading } = useLabels();
  const { openDropdownId, openDropdown, closeDropdown } = useDropdown();

  const isOpen = openDropdownId === id;

  // Filtrar categorías que tienen etiquetas (filtro base)
  const categoriesWithValidLabels = useMemo(() =>
    categoriesWithLabels.filter(category =>
      Array.isArray(category.labels) && category.labels.length > 0
    ),
    [categoriesWithLabels]
  );

  // Filtrar categorías y etiquetas según el término de búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categoriesWithValidLabels;

    const searchTermLower = searchTerm.trim().toLowerCase();

    return categoriesWithValidLabels
      .map(category => {
        // Filtramos las etiquetas de esta categoría
        const filteredLabels = category.labels.filter(label =>
          label.name.toLowerCase().includes(searchTermLower)
        );

        // Si hay etiquetas que coinciden, devolvemos la categoría con esas etiquetas
        if (filteredLabels.length > 0) {
          return { ...category, labels: filteredLabels };
        }
        // Si no hay etiquetas que coincidan, no incluimos esta categoría
        return null;
      })
      .filter(Boolean); // Eliminamos los nulls (categorías sin etiquetas coincidentes)
  }, [categoriesWithValidLabels, searchTerm]);

  // Manejador para actualizar el término de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar búsqueda cuando se cierra el dropdown
  const handleToggleDropdown = (isOpen) => {
    if (isOpen) {
      openDropdown(id);
    } else {
      closeDropdown();
      setSearchTerm('');
    }
  };

  // Usar onSelect si está presente, de lo contrario usar onLabelSelect
  const handleLabelSelect = (label) => {
    if (onSelect) {
      onSelect(label);
    } else if (onLabelSelect) {
      onLabelSelect(label);
    }
  };

  // Usar onRemove si está presente, de lo contrario usar onLabelRemove
  const handleLabelRemove = (label) => {
    if (onRemove) {
      onRemove(label);
    } else if (onLabelRemove) {
      onLabelRemove(label);
    }
  };

  return (
    <div className="w-100">
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
              onDelete={() => handleLabelRemove(label)}
              showPhotoCount={showPhotoCount}
            />
          ))
        )}
      </div>

      {/* Dropdown para seleccionar etiquetas */}
      <Dropdown
        show={isOpen}
        onToggle={handleToggleDropdown}
        autoClose={false}
        className="w-100"
      >
        <Dropdown.Toggle variant="outline-secondary" size="sm" id={`label-dropdown-${id}`} className="w-100 d-flex justify-content-between align-items-center">
          <span><i className="bi bi-tag me-1"></i> {t('labels:dropdown.select')}</span>
          <i className="bi bi-chevron-down"></i>
        </Dropdown.Toggle>
        <Dropdown.Menu
          style={{
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          className="w-100"
        >
          {/* Buscador */}
          <div className="px-2 py-2 border-bottom">
            <InputGroup size="sm">
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                size="sm"
                type="text"
                placeholder={t('filters:dropdown.search')}
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()} // Evitar que el dropdown se cierre
              />
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                  size="sm"
                >
                  <i className="bi bi-x"></i>
                </Button>
              )}
            </InputGroup>
          </div>

          {labelsLoading ? (
            <Dropdown.Item disabled>{t('dropdown.loading')}</Dropdown.Item>
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
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
                        if (!isSelected) handleLabelSelect(label);
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
          ) : searchTerm ? (
            <Dropdown.Item disabled>{t('filters:dropdown.no_results')}</Dropdown.Item>
          ) : (
            <Dropdown.Item disabled>{t('labels:dropdown.no_labels')}</Dropdown.Item>
          )}

          <div className="d-grid gap-2 px-2 mt-2 mb-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => closeDropdown()}
            >
              <i className="bi bi-check2-all me-1"></i> {t('common:buttons.close')}
            </Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>

      {/* Estilo para evitar el highlight azul al hacer clic */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-label-item:active,
        .custom-label-item.active {
          background-color: transparent !important;
          color: inherit !important;
        }
      `}} />
    </div>
  );
};

export default LabelSelector; 