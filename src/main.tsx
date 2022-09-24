import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.scss';
import './styles/utils.scss';
import Bmob from 'hydrogen-js-sdk';

// Bmob初始化
// @ts-ignore
Bmob.initialize(
    import.meta.env.VITE_BMOB_SECRETKEY,
    import.meta.env.VITE_BMOB_SECCODE
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
