import { useGoogleMap } from "@ubilabs/google-maps-react-hooks";
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { socket } from "../lib/socket";

import Config from "../config";

function useMap(POSITIONS) {
  const [keyPolyline, setKeyPolyline] = useState(0);
  const [group, setGroup] = useState(null);
  const [userList, setUserList] = useState([]);
  const [oneUserList, setOneUserList] = useState([]);
  const [oneUserPolyline, setOneUserPolyline] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedUser, setSelectedUser] = useState("0");
  const [messages, setMessages] = useState([]);

  const map = useGoogleMap();

  const changeZone = (e) => {
    map.setZoom(POSITIONS[parseInt(e.target.value)].zoom);
    map.panTo(POSITIONS[parseInt(e.target.value)].position);
  };

  const selectUser = async (e) => {
    setSelectedUser(e.target.value);
    const userId = userList.findIndex((user) => user.id === e.target.value);
    if (userId === -1) {
      return;
    }
    const { data } = await axios(
      process.env.REACT_APP_SOCKET_URL + "/api/v1/map/" + e.target.value
    );
    const newOneUserList = data.georefs.results.map((georef, index) => ({
      id: georef.id,
      nameUsuario: userList[userId].nameUsuario,
      latRef: georef.latRef,
      longRef: georef.longRef,
      fechaRegistro: georef.fechaRegistro,
    }));
    setOneUserList(newOneUserList);
    const newActualSolicitudes = [];
    data.solicitudes.results.forEach((solicitud) => {
      const first = solicitud.dirRecoleccion.split(",");
      newActualSolicitudes.push([first[0], first[1]]);
      const second = solicitud.dirEntrega.split(",");
      newActualSolicitudes.push([second[0], second[1]]);
    });
    const newSolicitudes = newActualSolicitudes.map((solicitudes, index) => ({
      id: index,
      latRef: parseFloat(solicitudes[0]),
      longRef: parseFloat(solicitudes[1]),
    }));
    setSolicitudes(newSolicitudes);
    centerInMapPoints([...newOneUserList, ...newSolicitudes]);
  };

  const centerInMapPoints = useCallback(
    (points) => {
      const initialBounds = new window.google.maps.LatLngBounds();
      points.forEach((point) => {
        initialBounds.extend({ lat: point.latRef, lng: point.longRef });
      });

      map.fitBounds(initialBounds);
    },
    [map]
  );

  const obtainDriversLastLocation = async () => {
    const { data } = await axios(Config.socketUrl + "/api/v1/map");
    setUserList(
      data.results.map((user) => ({
        id: user.id,
        nameUsuario: user.nameUsuario,
        latRef: user.georeferencias[0].latRef,
        longRef: user.georeferencias[0].longRef,
        fechaRegistro: user.georeferencias[0].fechaRegistro,
        showMessage: false,
      }))
    );
  };

  const showUserList = useMemo(() => {
    if (selectedUser === "0") {
      return userList;
    } else {
      setKeyPolyline((prev) => prev + 1);
      return oneUserList;
    }
  }, [oneUserList, selectedUser, userList]);

  useEffect(() => {
    obtainDriversLastLocation();
  }, []);

  const addMarkerToMarkerList = useCallback(
    (data) => {
      const newMarkerList = [...userList];
      const markerId = newMarkerList.findIndex(
        (marker) => marker.id === data.userId
      );
      const dataToPush = {
        id: data.userId,
        nameUsuario: data.nameUsuario,
        latRef: data.latRef,
        longRef: data.longRef,
        fechaRegistro: data.fechaRegistro,
      };
      const message = `Name:${dataToPush.nameUsuario} Y: ${dataToPush.latRef} X: ${dataToPush.longRef} Time: ${dataToPush.fechaRegistro}`;
      setMessages([...messages, { message, id: messages.length }]);
      markerId === -1
        ? newMarkerList.push(dataToPush)
        : (newMarkerList[markerId] = {
            ...newMarkerList[markerId],
            ...dataToPush,
          });
      setUserList([...newMarkerList]);
      if (selectedUser === data.userId) {
        const newOneUserList = [...oneUserList];
        newOneUserList.push({ ...dataToPush, id: data.id });
        setOneUserList([...newOneUserList]);
      }
    },
    [messages, oneUserList, selectedUser, userList]
  );

  useEffect(() => {
    socket.connect();
    socket.on("r_location", addMarkerToMarkerList);
    setKeyPolyline((prev) => prev + 1);
  }, [addMarkerToMarkerList, messages, oneUserList, selectedUser, userList]);

  return {
    showUserList,
    selectedUser,
    solicitudes,
    changeZone,
    selectUser,
    userList,
    messages,
    keyPolyline,
  };

  // return {
  //   setGroup,
  //   oneUserPolyline,
  //   bounds,
  // };
}

export default useMap;
