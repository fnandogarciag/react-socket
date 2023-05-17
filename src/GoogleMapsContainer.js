import CustomMap from './components/CustomMap';
import useMap from './CustomStates/useMap';
import CustomMarkerClusterer from './components/CustomMarkerClusterer';
import CustomMarker from './components/CustomMarker';
import CustomPolyline from './components/CustomPolyline';
import Config from './config';

const POSITIONS = {
  0: { position: Config.initialPosition, zoom: Config.initialZoom },
  1: { position: { lat: 4.675, lng: -74.056 }, zoom: 18 },
  2: { position: { lat: 4.675, lng: -74.062 }, zoom: 18 },
};
const AppGoogleContainer = ({ mapRef }) => {
  const {
    showUserList,
    selectedUser,
    solicitudes,
    changeZone,
    selectUser,
    userList,
    messages,
    keyPolyline,
  } = useMap(POSITIONS);
  console.log(showUserList);
  return (
    <div className="container">
      <div id="container">
        <CustomMap ref={mapRef} />
        {selectedUser === '0' ? (
          <CustomMarkerClusterer markers={showUserList} />
        ) : (
          <>
            {showUserList.length <= 1 ? (
              [...showUserList].map((user) => (
                <CustomMarker
                  key={user.id}
                  marker={user}
                  message={`Name:${user.nameUsuario} Y: ${user.lat} X: ${user.lng} Time: ${user.fechaRegistro}`}
                />
              ))
            ) : (
              <CustomPolyline
                key={`0${keyPolyline}`}
                points={showUserList}
                colorLine="green"
                colorArrow="black"
              />
            )}
            {solicitudes.length <= 1 ? null : (
              <CustomPolyline
                key={`1${keyPolyline}`}
                points={solicitudes}
                optimize={true}
                colorLine="blue"
                colorArrow="red"
                route={true}
              />
            )}
          </>
        )}
      </div>
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
              {user.nameUsuario}
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
};

export default AppGoogleContainer;
