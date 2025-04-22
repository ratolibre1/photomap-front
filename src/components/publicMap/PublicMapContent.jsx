import React from 'react';
import MapContent from './MapContent';

const PublicMapContent = ({ shareId, isPreview = false }) => {
  return <MapContent shareId={shareId} isPreview={isPreview} />;
};

export default PublicMapContent; 