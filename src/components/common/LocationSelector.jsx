import React, { useState, useEffect, useMemo } from 'react';
import { Dropdown, Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDropdown } from '../../context/DropdownContext';

const LocationSelector = ({
  options = [],
  selectedValue = '',
  onSelect,
  placeholder = 'Seleccionar',
  loading = false,
  noOptionsMessage = 'No hay opciones disponibles',
  icon = 'geo-alt',
  id // ID único para este selector
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, i18n } = useTranslation(['filters', 'common']);
  const { openDropdownId, openDropdown, closeDropdown } = useDropdown();

  const isOpen = openDropdownId === id;

  // Ordenar opciones alfabéticamente respetando las reglas de localización
  const sortedOptions = useMemo(() => {
    if (!options || options.length === 0) return [];

    // Crear un comparador que respete las reglas de ordenación del idioma actual
    const collator = new Intl.Collator(i18n.language, { sensitivity: 'base' });

    // Hacer una copia para no modificar el array original
    return [...options].sort((a, b) => collator.compare(a.name, b.name));
  }, [options, i18n.language]);

  // Filtrar opciones según el término de búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return sortedOptions;

    return sortedOptions.filter(option =>
      option.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [sortedOptions, searchTerm]);

  // Manejador para actualizar el término de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gestionar apertura/cierre del dropdown
  const handleToggleDropdown = (isOpen) => {
    if (isOpen) {
      openDropdown(id);
    } else {
      closeDropdown();
      setSearchTerm('');
    }
  };

  // Cerrar este dropdown si se abre otro
  useEffect(() => {
    if (openDropdownId !== id && isOpen) {
      setSearchTerm('');
    }
  }, [openDropdownId, id, isOpen]);

  // Encontrar el nombre de la opción seleccionada
  const selectedOption = options.find(option => (option.id || option._id) === selectedValue);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  return (
    <div className="w-100">
      {/* Dropdown para seleccionar ubicación */}
      <Dropdown
        show={isOpen}
        onToggle={handleToggleDropdown}
        className="w-100"
      >
        <Dropdown.Toggle
          variant="outline-secondary"
          size="sm"
          id={`location-dropdown-${id}`}
          className="w-100 d-flex justify-content-between align-items-center text-start"
        >
          <div className="text-truncate">
            <i className={`bi bi-${icon} me-2 ${selectedOption ? 'text-primary' : ''}`}></i>
            <span className={selectedOption ? 'fw-bold' : 'text-muted'}>{displayText}</span>
          </div>
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

          {loading ? (
            <Dropdown.Item disabled>{t('common:loading.default')}</Dropdown.Item>
          ) : filteredOptions.length > 0 ? (
            <>
              {selectedValue && (
                <>
                  <Dropdown.Item
                    onClick={() => {
                      onSelect('');
                      closeDropdown();
                    }}
                    active={false}
                    className="clear-selection-item text-center py-2"
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-x-circle me-2"></i>
                      <span className="fw-bold">{t('filters:dropdown.clear_selection')}</span>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                </>
              )}

              {filteredOptions.map(option => (
                <Dropdown.Item
                  key={option.id || option._id}
                  onClick={() => {
                    onSelect(option.id || option._id);
                    closeDropdown();
                  }}
                  active={selectedValue === (option.id || option._id)}
                  className="location-item"
                >
                  <div className="d-flex align-items-center py-1">
                    <i className={`bi bi-${icon} me-2 text-primary`}></i>
                    <span>{option.name}</span>
                  </div>
                </Dropdown.Item>
              ))}
            </>
          ) : searchTerm ? (
            <Dropdown.Item disabled className="location-item">{t('filters:dropdown.no_results')}</Dropdown.Item>
          ) : (
            <Dropdown.Item disabled className="location-item">{noOptionsMessage}</Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default LocationSelector; 