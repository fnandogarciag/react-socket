import { forwardRef } from 'react';

const MapCanvas = forwardRef((_, ref) => (
  <div ref={ref} className="map-container" />
));
MapCanvas.displayName = 'MapCanvas';

export default MapCanvas;
