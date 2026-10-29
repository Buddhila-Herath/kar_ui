import React from 'react';
import MasterLayout from '../../MasterLayout';
import {useNavigate} from 'react-router-dom';
import {Filters} from '../../../constants';
import VendorForm from './VendorForm';
import {placeholderText} from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';

const CreateVendor = () => {
    const navigate = useNavigate();

    const addVendorData = (formValue) => {
        addVendor(formValue, navigate, Filters.OBJ);
    };

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("vendors.create.title")} />
            <Breadcrumb 
                parent_menu="Vendor Management"
                parent_menu_url="/admin/vendor-management"
                current_page="Add New Vendor"
            />
            <VendorForm addVendorData={addVendorData}/>
        </MasterLayout>
    )
};

export default CreateVendor;
