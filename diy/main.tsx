import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../src/App';
import '../src/styles/global.scss';
import '../src/styles/utils.scss';
import { domRelatedOptForTheme } from '../src/utils';
import theme from './diy.theme.json';

domRelatedOptForTheme(theme);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App theme={theme} />
    </React.StrictMode>
);
