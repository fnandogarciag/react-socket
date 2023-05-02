import { useEffect, useState } from "react";
import { socket } from "./socket";
import { MapContainer, Marker, Popup } from "react-leaflet";
import CustomTileLayer from "./components/CustomTileLayer";

const INITIALPOSITION = [4.675, -74.059];
const INITIALZOOM = 17;
const POSITIONS = {
  0: { position: INITIALPOSITION, zoom: INITIALZOOM },
  1: { position: [4.675, -74.056], zoom: 18 },
  2: { position: [4.675, -74.062], zoom: 18 },
};

function App() {
  const [map, setMap] = useState(null);
  const [userList, setUserList] = useState([]);
  const [oneUserList, setOneUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState("0");
  const [showUserList, setShowUserList] = useState(userList);
  const [messages, setMessages] = useState([]);

  const changeZone = (e) => {
    map.flyTo(
      POSITIONS[parseInt(e.target.value)].position,
      POSITIONS[parseInt(e.target.value)].zoom
    );
  };
  const selectUser = (e) => {
    setSelectedUser(e.target.value);
    const userId = userList.findIndex((user) => user.id === e.target.value);
    if (userId === -1) {
      return;
    }
    setOneUserList([userList[userId]]);
  };

  useEffect(() => {
    socket.connect();
    const addMarkerToMarkerList = (data) => {
      const message = `Name:${data.name} X: ${data.xpos} Y: ${data.ypos} Time: ${data.time}`;
      setMessages([...messages, { message, id: messages.length }]);
      const newMarkerList = [...userList];
      const markerId = newMarkerList.findIndex(
        (marker) => marker.id === data.id
      );
      markerId === -1
        ? newMarkerList.push(data)
        : (newMarkerList[markerId] = { ...newMarkerList[markerId], ...data });
      setUserList([...newMarkerList]);
    };

    socket.on("r_location", addMarkerToMarkerList);
    return () => {
      socket.off("r_location", addMarkerToMarkerList);
      socket.disconnect();
    };
  }, [messages, userList]);

  useEffect(() => {
    selectedUser === "0"
      ? setShowUserList(userList)
      : setShowUserList(oneUserList);
  }, [selectedUser, userList, oneUserList]);

  return (
    <div className="container">
      <MapContainer
        zoom={INITIALZOOM}
        center={INITIALPOSITION}
        scrollWheelZoom={true}
        ref={setMap}
        className="map-container"
      >
        <CustomTileLayer />
        {showUserList.map((marker) => (
          <Marker key={marker.id} position={[marker.ypos, marker.xpos]}>
            <Popup>
              {`Name:${marker.name} X: ${marker.xpos} Y: ${marker.ypos} Time: ${marker.time}`}{" "}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div>
        <h2 id="company" className="title">
          Novus
        </h2>
        <select className="selectOption" onChange={changeZone}>
          <option value="0">All</option>
          <option value="1">Right</option>
          <option value="2">Left</option>
        </select>
        <select id="users" className="selectOption" onChange={selectUser}>
          <option value="0">All</option>
          {userList.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <ul id="messages">
          {messages.map((message) => (
            <li key={message.id}>{message.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
