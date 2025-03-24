import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const SearchBar = ({ searchTerm, onSearch, showSearchFilters, setShowSearchFilters }) => {
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
            variant={showSearchFilters ? "secondary" : "outline-secondary"}
            onClick={() => setShowSearchFilters(!showSearchFilters)}
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