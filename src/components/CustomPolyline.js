import { useCallback, useEffect } from "react";
import {
  useDirectionsService,
  useGoogleMap,
} from "@ubilabs/google-maps-react-hooks";

const CustomPolyline = ({ points, optimize = false, color = "#FB2576" }) => {
  const map = useGoogleMap();

  const directionsOptions = {
    renderOnMap: true,
    renderOptions: {
      suppressMarkers: true,
    },
  };

  const { directionsService, directionsRenderer } =
    useDirectionsService(directionsOptions);

  const createRoute = useCallback(
    async (request) => {
      try {
        const data = await directionsService.route(request);
        directionsRenderer.setDirections(data);
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: color,
            strokeWeight: 4,
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
    [color, directionsRenderer, directionsService]
  );

  useEffect(() => {
    if (!directionsService || !map) {
      return () => {};
    }
    const waypoints = [];
    for (let index = 1; index < points.length; index++) {
      waypoints.push({
        location: {
          lat: points[index]["latRef"],
          lng: points[index]["longRef"],
        },
      });
    }
    const request = {
      travelMode: window.google.maps.TravelMode.DRIVING,
      origin: {
        lat: points[0]["latRef"],
        lng: points[0]["longRef"],
      },
      destination: {
        lat: points[0]["latRef"],
        lng: points[0]["longRef"],
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
  ]);

  return null;
};

export default CustomPolyline;
