import React from 'react';
import { useParams } from 'react-router-dom';
import PublicMapContent from '../components/publicMap/PublicMapContent';

const PublicMap = () => {
  const { shareId } = useParams();

  return <PublicMapContent shareId={shareId} />;
};

export default PublicMap; 