import { useGoogleMap } from '@ubilabs/google-maps-react-hooks';
import { useEffect } from 'react';

const CustomMarker = ({
  marker,
  message = null,
  markerClusterer = null,
  color = null,
  countable = false,
}) => {
  const map = useGoogleMap();

  useEffect(() => {
    if (!markerClusterer) if (!map) return;
    const markerOptions = {
      position: {
        lat: marker.lat,
        lng: marker.lng,
      },
      title: message,
      label: !countable
        ? null
        : {
            text: countable,
            color: 'white',
            fontSize: '16px',
          },
      icon: !color
        ? null
        : {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 9 + `${countable}`.length * 3,
          },
    };
    const newMarkerElement = new window.google.maps.Marker(markerOptions);
    let infoWindowState = false;
    if (message) {
      const newInfoWindow = new window.google.maps.InfoWindow({});
      newInfoWindow.setContent(newMarkerElement.getTitle());
      newMarkerElement.addListener('click', () => {
        if (infoWindowState) {
          newInfoWindow.close();
        } else {
          newInfoWindow.open(map, newMarkerElement);
        }
        infoWindowState = !infoWindowState;
      });
    }

    markerClusterer
      ? markerClusterer.addMarker(newMarkerElement)
      : newMarkerElement.setMap(map);
    return () => {
      if (message) {
        infoWindowState = false;
      }
      markerClusterer
        ? markerClusterer.removeMarker(newMarkerElement)
        : newMarkerElement.setMap(null);
    };
  }, [color, countable, map, marker, markerClusterer, message]);

  return null;
};

export default CustomMarker;
