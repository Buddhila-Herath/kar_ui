import React, { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import MasterLayout from '../../MasterLayout';
import VendorForm from './VendorForm';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import { fetchVendorDetails } from '../../../slices/vendorSlice';
import PreventNavigation from "../../../shared/components/PreventNavigation";
import Spinner from "../../../shared/components/loaders/Spinner";
import { placeholderText } from '../../../shared/sharedMethod';

const EditVendor = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { vendor, isVendorDetailsLoading } = useSelector((state) => ({
        vendor: state.vendors.vendorDetails || {},
        isVendorDetailsLoading: state.vendors.isVendorDetailsLoading,
    }));

    useEffect(() => {
        if (id) {
            dispatch(fetchVendorDetails({ id, type: 'edit' }));
        }
    }, [id, dispatch]);

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("vendors.create.edit")} />
            <Breadcrumb 
                parent_menu="Vendor Management"
                parent_menu_url="/admin/vendor-management"
                current_page="Edit Vendor"
            />
            <PreventNavigation />
            {isVendorDetailsLoading ? 
                <Spinner />
            : 
                <VendorForm vendor={vendor} isEdit={true} sId={id} /> 
            }
        </MasterLayout>
    )
};

export default EditVendor;
