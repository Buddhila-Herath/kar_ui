import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store';
import { ConfigProvider } from './config/service';
 
// Render the app
createRoot(document.getElementById('root')).render(
    <ConfigProvider>
        <Provider store={store}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true}} >
                <App />
            </BrowserRouter>
        </Provider>
    </ConfigProvider>
);
    