import React, { createContext, useContext, useEffect, useState } from 'react';

// Synchronous config loader
let cachedConfig = null;
let configPromise = null;

export const getConfig = () => {
    if (cachedConfig) {
        return cachedConfig;
    }

    // Try to load from localStorage first
    const storedConfig = localStorage.getItem('app_config');
    if (storedConfig) {
        try {
            cachedConfig = JSON.parse(storedConfig);
            return cachedConfig;
        } catch (e) {
            console.error('Failed to parse stored config:', e);
        }
    }

    // If no config is available yet, return the promise
    if (!configPromise) {
        configPromise = new Promise((resolve) => {
            const checkConfig = () => {
                if (cachedConfig) {
                    resolve(cachedConfig);
                } else {
                    setTimeout(checkConfig, 100);
                }
            };
            checkConfig();
        });
    }
    return configPromise;
};

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const isDev = window.location.hostname === 'localhost';
                const response = await fetch(
                    isDev ? '/config.dev.json' : '/config.json'
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();
                setConfig(json);
                cachedConfig = json;
                localStorage.setItem('app_config', JSON.stringify(json));
            } catch (error) {
                console.error('Failed to load configuration:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConfig();
    }, []);

    const get = (key) => {
        if (!config) throw new Error('Configuration not loaded');
        return config[key];
    };

    return (
        <ConfigContext.Provider value={{ config, get, isLoading }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
