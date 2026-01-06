import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// SDK script will be loaded dynamically in Avatar component
// <script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js"></script>

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
