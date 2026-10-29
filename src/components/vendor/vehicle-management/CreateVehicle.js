import React from 'react';
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import VehicleForm from './VehicleForm';
import PreventNavigation from "../../../shared/components/PreventNavigation";

const CreateVehicle = () => {
    return (
        <MasterLayout>
            <TabTitle title="Add New Vehicle" />
            <Breadcrumb
                parent_menu="Vehicle Management"
                parent_menu_url="/app/vehicle-management"
                current_page="Add New Vehicle"
            />
            <PreventNavigation />
            <VehicleForm isEdit={false} />
        </MasterLayout>
    )
};

export default CreateVehicle;
