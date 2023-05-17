import { useCallback, useState } from 'react';
import { GoogleMapsProvider } from '@ubilabs/google-maps-react-hooks';

import Config from './config';

import GoogleMapsContainer from './GoogleMapsContainer';
// import ATestRoute from "./ATestRoute";

const mapOptions = {
  center: Config.initialPosition,
  zoom: 13,
  disableDefaultUI: true,
  zoomControl: true,
};

const App = () => {
  const [mapContainer, setMapContainer] = useState(null);

  const mapRef = useCallback((node) => {
    node && setMapContainer(node);
  }, []);

  return (
    <GoogleMapsProvider
      googleMapsAPIKey={Config.googleMapsApi}
      mapContainer={mapContainer}
      mapOptions={mapOptions}
    >
      <GoogleMapsContainer mapRef={mapRef} />
      {/* <ATestRoute mapRef={mapRef} /> */}
    </GoogleMapsProvider>
  );
};

export default App;
