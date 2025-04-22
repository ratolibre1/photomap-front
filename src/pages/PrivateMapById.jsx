import React from 'react';
import { useParams } from 'react-router-dom';
import MapContent from '../components/publicMap/MapContent';

const PrivateMapById = () => {
  const { mapId } = useParams();

  return <MapContent mapId={mapId} isPreview={true} />;
};

export default PrivateMapById; 