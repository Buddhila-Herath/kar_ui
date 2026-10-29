import React from 'react';
import MasterLayout from '../../MasterLayout';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import TechnicianForm from './TechnicianForm';
import PreventNavigation from "../../../shared/components/PreventNavigation";

const CreateTechnician = () => {
    return (
        <MasterLayout>
            <TabTitle title="Add New Technician" />
            <Breadcrumb
                parent_menu="Technician Management"
                parent_menu_url="/app/technician-management"
                current_page="Add New Technician"
            />
            <PreventNavigation />
            <TechnicianForm />
        </MasterLayout>
    )
};

export default CreateTechnician;
