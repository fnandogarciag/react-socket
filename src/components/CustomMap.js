import { forwardRef } from "react";

const MapCanvas = forwardRef((_, ref) => (
  <div ref={ref} className="map-container" />
));

export default MapCanvas;
