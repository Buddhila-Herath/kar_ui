import React from 'react';
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import { placeholderText } from '../../../shared/sharedMethod';
import Widget from './Widget';
import Jobs from './Jobs';
import {getFormattedMessage} from '../../../shared/sharedMethod';

const Dashboard = () => {
    return (
        <MasterLayout> 
            <TabTitle title={placeholderText('dashboard.title')} />
            <div id="technician-dashboard-widget">
                <Widget formattedMessage={getFormattedMessage} />
            </div>
            <div id="technician-dashboard-jobs">
                <Jobs />
            </div>
        </MasterLayout>
    )
}

export default Dashboard;