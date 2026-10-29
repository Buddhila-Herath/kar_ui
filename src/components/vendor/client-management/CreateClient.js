import React from 'react';
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import ClientForm from './ClientForm';
import PreventNavigation from "../../../shared/components/PreventNavigation";

const CreateClient = () => {
    return (
        <MasterLayout>
            <TabTitle title="Add New Client" />
            <Breadcrumb
                parent_menu="Client Management"
                parent_menu_url="/app/client-management"
                current_page="Add New Client"
            />
            <PreventNavigation />
            <ClientForm isEdit={false} />
        </MasterLayout>
    )
};

export default CreateClient;
