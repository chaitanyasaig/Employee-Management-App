import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="chaitanyagudimetla.us.auth0.com"
      clientId="odzdIdKAA1D9aBMRZokPyaBImlgN8XCR"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://employee-api",
        scope: "openid profile email",
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);