import React from 'react';
import MasterLayout from '../../MasterLayout';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import ServiceForm from './ServiceForm';
import PreventNavigation from "../../../shared/components/PreventNavigation";

const CreateService = () => {
    return (
        <MasterLayout>
            <TabTitle title={placeholderText("services.create.button.title")} />
            <Breadcrumb
                parent_menu="Service Management"
                parent_menu_url="/admin/service-management"
                current_page="Add New Service"
            />
            <PreventNavigation />
            <ServiceForm />
        </MasterLayout>
    )
};

export default CreateService;
