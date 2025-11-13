import Echo from "laravel-echo";
import Pusher from "pusher-js";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import "./fonts.css";
import "./index.css";
import "./styles/dashboard.css";
import "./styles/assets.css";
import "./styles/perfil.css";
import "./styles/perfil.css";
import "leaflet/dist/leaflet.css";

import "react-credit-cards-2/dist/es/styles-compiled.css";
import "react-leaflet-fullscreen/styles.css";
import React from "react";

import App from "./App";

declare global {
  interface Window {
    Echo: Echo<any>;
    Pusher: any;
  }
}

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT,
  wssPort: import.meta.env.VITE_REVERB_PORT,
  wsPath: import.meta.env.VITE_REBERB_WS_PATH,
  forceTLS: true,
  enabledTransports: ["ws", "wss"],
});

// biome-ignore lint/style/noNonNullAssertion: ignorar
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
