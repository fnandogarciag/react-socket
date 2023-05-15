const Config = {
  socketUrl: process.env.REACT_APP_SOCKET_URL || "http://localhost:4500",
  googleMapsApi: process.env.REACT_APP_GOOGLE_MAPS_API || "",
  initialPosition: {
    lat: parseFloat(process.env.REACT_APP_INITIAL_LAT || "4.675"),
    lng: parseFloat(process.env.REACT_APP_INITIAL_LNG || "-74.059"),
  },
  initialZoom: parseInt(process.env.REACT_APP_INITIAL_ZOOM || "17"),
};

export default Config;
