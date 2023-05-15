import { io } from "socket.io-client";
import Config from "../config";

// "undefined" means the URL will be computed from the `window.location` object
const URL = Config.socketUrl;

const socket = io(URL, {
  query: {
    id: 1,
  },
});

export { socket };
