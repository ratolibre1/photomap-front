import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ searchTerm, onSearch }) => {
  const { t } = useTranslation(['photos']);

  return (
    <div className="mb-3">
      <Form.Group>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder={t('photos:gallery.search_placeholder')}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </InputGroup>
      </Form.Group>
    </div>
  );
};

export default SearchBar; 