import { useLabels } from '../context/LabelContext';
import LabelBadge from '../components/common/LabelBadge';

const PhotoUpload = () => {
  const [selectedLabels, setSelectedLabels] = useState([]);
  const { categoriesWithLabels, loading: labelsLoading } = useLabels();

  const handleAddLabel = (label) => {
    if (!selectedLabels.some(item => (item._id || item.id) === (label._id || label.id))) {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setSelectedLabels(selectedLabels.filter(label =>
      (label._id || label.id) !== (labelToRemove._id || labelToRemove.id)
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    const labelIds = selectedLabels.map(label => label._id || label.id);
    formData.append('labels', JSON.stringify(labelIds));

  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Etiquetas</Form.Label>

        <div className="d-flex flex-wrap gap-2 mb-2">
          {selectedLabels.length > 0 ? (
            selectedLabels.map(label => (
              <LabelBadge
                key={label._id || label.id}
                label={label}
                showEditButton={false}
                onDelete={handleRemoveLabel}
              />
            ))
          ) : (
            <span className="text-muted">Ninguna etiqueta seleccionada</span>
          )}
        </div>

        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="label-dropdown" className="mt-2">
            <i className="bi bi-tag me-1"></i> Agregar etiqueta
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {labelsLoading ? (
              <Dropdown.Item disabled>Cargando etiquetas...</Dropdown.Item>
            ) : (
              categoriesWithLabels.map(category => (
                <div key={category._id || category.id}>
                  <Dropdown.Header>{category.name}</Dropdown.Header>
                  {category.labels?.map(label => {
                    const isSelected = selectedLabels.some(selected =>
                      (selected._id || selected.id) === (label._id || label.id)
                    );

                    return (
                      <Dropdown.Item
                        key={label._id || label.id}
                        onClick={() => handleAddLabel(label)}
                        disabled={isSelected}
                      >
                        <LabelBadge
                          label={label}
                          showEditButton={false}
                          disabled={isSelected}
                        />
                      </Dropdown.Item>
                    );
                  })}
                  <Dropdown.Divider />
                </div>
              ))
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Form.Group>
    </Form>
  );
}; 