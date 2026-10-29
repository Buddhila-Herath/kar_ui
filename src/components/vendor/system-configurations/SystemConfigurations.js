import React, { useState } from 'react';
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import { placeholderText } from '../../../shared/sharedMethod';
import GlobalSettings from './GlobalSettings';
import RateCardConfiguration from './RateCardConfiguration';

const SystemConfigurations = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("system-configurations.title")} />
            <Breadcrumb
                current_page="System Configurations"
            />
            <div className="system-configurations-container">
                <div className="system-configurations-tab-header">
                    <div className={`tab-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => handleTabClick(0)}>
                        <h3>Global Settings</h3>
                    </div>
                    <div className="tab-separator" />
                    <div className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleTabClick(1)}>
                        <h3>Rate Card Configuration</h3>
                    </div>
                </div>
                {activeTab === 0 && (
                    <GlobalSettings />
                )}
                {activeTab === 1 && (
                    <RateCardConfiguration />
                )}
            </div>
        </MasterLayout>
    );
};

export default SystemConfigurations;