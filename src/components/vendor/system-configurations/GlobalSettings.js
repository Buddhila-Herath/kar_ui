import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Spinner from "../../../shared/components/loaders/Spinner";
import { fetchSystemConfiguration, updateSystemConfiguration } from '../../../slices/vendor/systemConfigurationSlice';

const GlobalSettings = () => {
    const dispatch = useDispatch();
    const { systemConfig, isLoading, error } = useSelector((state) => state.systemConfiguration);

    const [rateCardEnabled, setRateCardEnabled] = useState(false);
    const [sparePartsEnabled, setSparePartsEnabled] = useState(false);
    const [serviceEnabled, setServiceEnabled] = useState(false);

    useEffect(() => {
        dispatch(fetchSystemConfiguration());
    }, [dispatch]);

    useEffect(() => {
        if (systemConfig) {
            setRateCardEnabled(systemConfig.rateCardIsEnabled);
            setSparePartsEnabled(systemConfig.partsIsEnabled);
            setServiceEnabled(systemConfig.serviceIsEnabled);
        }
    }, [systemConfig]);

    const handleToggle = (key, value) => {
        const newConfig = {
            rateCardEnable: key === 'rateCard' ? value : rateCardEnabled,
            sparePartsEnable: key === 'spareParts' ? value : sparePartsEnabled,
            serviceEnable: key === 'service' ? value : serviceEnabled,
        };

        dispatch(updateSystemConfiguration(newConfig));
    };

    return (
        <>
            {isLoading ? <Spinner /> :
                <div className="global-settings-container">
                    <div className="global-settings-switch">
                        <h3>Global Spare Parts</h3>
                        <label className="custom-switch">
                            <input
                                type="checkbox"
                                checked={sparePartsEnabled}
                                disabled={isLoading}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    setSparePartsEnabled(value);
                                    handleToggle('spareParts', value);
                                }}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="global-settings-switch">
                        <h3>Global Services</h3>
                        <label className="custom-switch">
                            <input
                                type="checkbox"
                                checked={serviceEnabled}
                                disabled={isLoading}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    setServiceEnabled(value);
                                    handleToggle('service', value);
                                }}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="global-settings-switch">
                        <h3>Global Rate Cards</h3>
                        <label className="custom-switch">
                            <input
                                type="checkbox"
                                checked={rateCardEnabled}
                                disabled={isLoading}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    setRateCardEnabled(value);
                                    handleToggle('rateCard', value);
                                }}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            }
        </>
    );
};

export default GlobalSettings;