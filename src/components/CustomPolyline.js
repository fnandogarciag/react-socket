import { useCallback, useEffect, useState } from 'react';
import {
  useDirectionsService,
  useGoogleMap,
} from '@ubilabs/google-maps-react-hooks';
import CustomMarker from './CustomMarker';

const CustomPolyline = ({
  points,
  optimize = false,
  colorLine = 'red',
  colorArrow = 'black',
  route = false,
}) => {
  const [orderMarkers, setOrderMarkers] = useState([]);
  const map = useGoogleMap();

  const directionsOptions = {
    renderOnMap: true,
    renderOptions: {
      suppressMarkers: true,
      preserveViewport: !route,
    },
  };

  const { directionsService, directionsRenderer } =
    useDirectionsService(directionsOptions);

  const createRoute = useCallback(
    async (request) => {
      const data = await directionsService.route(request);
      setOrderMarkers(
        data.routes[0].waypoint_order.map((position, index) => ({
          arrayPosition: position + 1,
          orderPosition: index + 1,
        }))
      );
      directionsRenderer.setDirections(data);
      directionsRenderer.setOptions({
        polylineOptions: {
          zIndex: route ? 0 : 1,
          strokeColor: colorLine,
          strokeWeight: 4,
          icons: [
            {
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                fillColor: colorArrow,
                fillOpacity: 1,
                strokeWeight: 0,
              },
              repeat: '50px',
            },
          ],
        },
      });
    },
    [colorArrow, colorLine, directionsRenderer, directionsService, route]
  );

  useEffect(() => {
    if (!directionsService || !map) {
      return () => {};
    }
    const waypoints = [];
    for (
      let index = 1;
      index < (route ? points.length : points.length - 1);
      index++
    ) {
      waypoints.push({
        location: {
          lat: points[index]['lat'],
          lng: points[index]['lng'],
        },
      });
    }
    const request = {
      travelMode: window.google.maps.TravelMode.DRIVING,
      origin: {
        lat: points[0]['lat'],
        lng: points[0]['lng'],
      },
      destination: {
        lat: route ? points[0]['lat'] : points.at(-1)['lat'],
        lng: route ? points[0]['lng'] : points.at(-1)['lng'],
      },
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
      },
      waypoints: waypoints,
      optimizeWaypoints: optimize,
    };

    createRoute(request);

    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [
    createRoute,
    directionsRenderer,
    directionsService,
    map,
    optimize,
    points,
    route,
  ]);
  return route ? (
    <>
      <CustomMarker
        key={points[0].id}
        marker={points[0]}
        color="black"
        message={`${points[0].direccion}`}
        countable={`${points[0].id}`}
      />
      {[...orderMarkers].map(({ arrayPosition, orderPosition }) => {
        return (
          <CustomMarker
            key={points[arrayPosition].id}
            marker={points[arrayPosition]}
            color="black"
            message={`${points[arrayPosition].direccion}`}
            countable={`${orderPosition}`}
          />
        );
      })}
    </>
  ) : (
    [...points].map((point) => (
      <CustomMarker
        key={point.id}
        marker={point}
        message={`Name:${point.nameUsuario} Y: ${point.lat} X: ${point.lng} Time: ${point.fechaRegistro}`}
      />
    ))
  );
};

export default CustomPolyline;
