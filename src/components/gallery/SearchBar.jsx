import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const SearchBar = ({ searchTerm, onSearch, showAdvancedFilters, setShowAdvancedFilters }) => {
  return (
    <div className="mb-3">
      <Form.Group>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Buscar fotos por título o descripción..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          <Button
            variant={showAdvancedFilters ? "secondary" : "outline-secondary"}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <i className="bi bi-sliders me-1"></i>
            Filtros avanzados
          </Button>
        </InputGroup>
      </Form.Group>
    </div>
  );
};

export default SearchBar; 