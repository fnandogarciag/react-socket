import { useEffect, useState } from 'react';
import { useGoogleMap } from '@ubilabs/google-maps-react-hooks';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

import SuperClusterAlgorithm from '../utils/superClusterAlgorithm';
import CustomMarker from './CustomMarker';

const CustomMarkerClusterer = ({ markers }) => {
  const [markerClusterer, setMarkerClusterer] = useState(null);
  const map = useGoogleMap();

  useEffect(() => {
    if (!map) return;
    const newMarkerClusterer = new MarkerClusterer({
      markers: [],
      map,
      maxZoom: 26,
      algorithm: new SuperClusterAlgorithm({ radius: 200 }),
    });
    setMarkerClusterer(newMarkerClusterer);
  }, [map]);

  return !markerClusterer ? null : (
    <>
      {[...markers].map((marker) => (
        <CustomMarker
          key={marker.id}
          marker={marker}
          message={`Name:${marker.nameUsuario} Y: ${marker.lat} X: ${marker.lng} Time: ${marker.fechaRegistro}`}
          markerClusterer={markerClusterer}
        />
      ))}
    </>
  );
};

export default CustomMarkerClusterer;
