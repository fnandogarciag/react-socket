import { useEffect } from "react";
import {
  useDirectionsService,
  useGoogleMap,
} from "@ubilabs/google-maps-react-hooks";

import CustomMap from "./components/CustomMap";

const ATestRoute = ({ mapRef }) => {
  const map = useGoogleMap();

  const directionsOptions = {
    renderOnMap: true,
    renderOptions: {},
  };

  const { directionsService, directionsRenderer } =
    useDirectionsService(directionsOptions);
  useEffect(() => {
    if (!map) return;
    directionsRenderer.setMap(map);

    // Configura las opciones para la ruta deseada
    var request = {
      origin: { lat: 4.674371322499614, lng: -74.0476711015089 },
      destination: { lat: 4.678905203887115, lng: -74.05593230473508 },
      travelMode: "DRIVING",
    };

    // Obtiene la ruta y la muestra en el mapa
    directionsService.route(request, function (result, status) {
      if (status === "OK") {
        directionsRenderer.setDirections(result);

        // Obtén los puntos de la línea
        var route = result.routes[0];
        console.log(result);
        var polyline = route.overview_polyline;
        var points = window.google.maps.geometry.encoding.decodePath(polyline);

        // Define la distancia mínima deseada desde la línea
        var minDistance = 1000; // Valor de ejemplo, ajusta según tus necesidades

        var symbols = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          strokeWeight: 2,
          fillColor: "red",
        };

        // Recorre las etapas de la dirección
        var legs = result.routes[0].legs;
        for (var i = 0; i < legs.length; i++) {
          var steps = legs[i].steps;
          for (var j = 0; j < steps.length; j++) {
            var markerOptions = {
              position: steps[j].start_location,
              icon: symbols,
              label: (j + 1).toString(), // Cambia la letra por el número correspondiente
            };
            var marker = new window.google.maps.Marker(markerOptions);
            marker.setMap(map);
          }
        }

        // Escucha el evento de clic en el mapa
        map.addListener("click", function (event) {
          var clickedPoint = event.latLng;

          // Verifica si el punto está dentro del cilindro alrededor de la línea
          var isInsideCylinder = checkPointInsideCylinder(
            clickedPoint,
            points,
            minDistance
          );

          // Realiza la acción deseada según el resultado de la verificación
          if (isInsideCylinder) {
            console.log(
              "El punto está dentro del cilindro alrededor de la línea."
            );
            // Realiza aquí las acciones que deseas cuando el punto está dentro del cilindro
          } else {
            console.log(
              "El punto está fuera del cilindro alrededor de la línea."
            );
            // Realiza aquí las acciones que deseas cuando el punto está fuera del cilindro
          }
        });
      }
    });
  }, [directionsRenderer, directionsService, map]);

  // Función para verificar si un punto está dentro del cilindro alrededor de la línea
  function checkPointInsideCylinder(point, linePoints, minDistance) {
    console.log(linePoints);
    for (var i = 0; i < linePoints.length; i++) {
      var linePoint = linePoints[i];
      var distance =
        window.google.maps.geometry.spherical.computeDistanceBetween(
          point,
          linePoint
        );
      if (distance <= minDistance) {
        return true; // El punto está dentro del cilindro
      }
    }
    return false; // El punto está fuera del cilindro
  }

  return <CustomMap ref={mapRef} />;
};

export default ATestRoute;
