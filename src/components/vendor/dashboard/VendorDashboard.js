import React, { useEffect, useState } from 'react';
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import { placeholderText } from '../../../shared/sharedMethod';
import VendorWidget from './VendorWidget';
import RecentActivities from './RecentActivities';
import {getFormattedMessage} from '../../../shared/sharedMethod';
import RangeTabs from './RangeTabs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorRecentActivities } from '../../../slices/vendor/recentActivitiesSlice';

const VendorDashboard = () => {
    const dispatch = useDispatch();
    const userToken = useSelector((state) => state.auth.userToken);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    useEffect(() => {
        dispatch(fetchVendorRecentActivities());
    }, [dispatch, userToken]);

    // Listen for sidebar collapse state changes
    useEffect(() => {
        const handleSidebarToggle = () => {
            setIsSidebarCollapsed(prev => !prev);
        };

        // Listen for custom events from RecentActivities component
        window.addEventListener('sidebarToggle', handleSidebarToggle);
        
        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle);
        };
    }, []);

    return (
        <MasterLayout> 
            <TabTitle title={placeholderText('dashboard.title')} />
            <div className={`vendor-dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="dashboard-main">
                    <VendorWidget formattedMessage={getFormattedMessage} /> 
                    <div className="mobile-recent-activities">
                        <RecentActivities />
                    </div>
                    <RangeTabs/>
                </div>
                <div className="dashboard-sidebar">
                    <RecentActivities />
                </div>
            </div>
        </MasterLayout>
    )
}

export default VendorDashboard;