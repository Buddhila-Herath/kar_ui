import React from 'react';
import MasterLayout from '../../MasterLayout';
import { placeholderText } from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import SparePartForm from './SparePartForm';
import PreventNavigation from "../../../shared/components/PreventNavigation";

const CreateSparePart = () => {
    return (
        <MasterLayout>
            <TabTitle title={placeholderText("spare-part.create.title")} />
            <Breadcrumb
                parent_menu="Spare Part Management"
                parent_menu_url="/app/spare-parts-management"
                current_page="Add New Spare Part"
            />
            <PreventNavigation />
            <SparePartForm />
        </MasterLayout>
    )
};

export default CreateSparePart;
