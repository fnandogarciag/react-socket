import { useGoogleMap } from '@ubilabs/google-maps-react-hooks';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { socket } from '../lib/socket';

import Config from '../config';

function useMap(POSITIONS) {
  const [keyPolyline, setKeyPolyline] = useState(0);
  const [userList, setUserList] = useState([]);
  const [oneUserList, setOneUserList] = useState([]);
  const [showUserList, setShowUserList] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedUser, setSelectedUser] = useState('0');
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
      Config.socketUrl + '/api/v1/map/' + e.target.value
    );
    const newOneUserList = data.georefs.results.map((georef) => ({
      id: georef.id,
      nameUsuario: userList[userId].nameUsuario,
      lat: georef.lat,
      lng: georef.lng,
      fechaRegistro: georef.fechaRegistro,
    }));
    setOneUserList(newOneUserList);
    const newActualSolicitudes = [];
    data.solicitudes.results.forEach((solicitud) => {
      newActualSolicitudes.push({
        lat: solicitud.latRecoleccion,
        lng: solicitud.lngRecoleccion,
        dir: solicitud.dirRecoleccion,
      });
      newActualSolicitudes.push({
        lat: solicitud.latEntrega,
        lng: solicitud.lngEntrega,
        dir: solicitud.dirEntrega,
      });
    });
    const newSolicitudes = newActualSolicitudes.map((solicitudes, index) => ({
      id: index,
      direccion: solicitudes.dir,
      lat: solicitudes.lat,
      lng: solicitudes.lng,
    }));
    setSolicitudes(newSolicitudes);
    centerInMapPoints([...newOneUserList, ...newSolicitudes]);
  };

  const centerInMapPoints = useCallback(
    (points) => {
      const initialBounds = new window.google.maps.LatLngBounds();
      points.forEach((point) => {
        initialBounds.extend({ lat: point.lat, lng: point.lng });
      });

      map.fitBounds(initialBounds);
    },
    [map]
  );

  const obtainDriversLastLocation = async () => {
    const { data } = await axios(Config.socketUrl + '/api/v1/map');
    console.log(data);
    setUserList(
      data.results.map((user) => ({
        id: user.id,
        nameUsuario: user.nameUsuario,
        lat: user.georeferencias[0].lat,
        lng: user.georeferencias[0].lng,
        fechaRegistro: user.georeferencias[0].fechaRegistro,
        showMessage: false,
      }))
    );
  };

  useEffect(() => {
    if (selectedUser === '0') {
      setShowUserList(userList);
    } else {
      setKeyPolyline((prev) => prev + 1);
      setShowUserList(oneUserList);
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
        lat: data.lat,
        lng: data.lng,
        fechaRegistro: data.fechaRegistro,
      };
      const message = `Name:${dataToPush.nameUsuario} Y: ${dataToPush.lat} X: ${dataToPush.lng} Time: ${dataToPush.fechaRegistro}`;
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
    socket.on('r_location', addMarkerToMarkerList);
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
