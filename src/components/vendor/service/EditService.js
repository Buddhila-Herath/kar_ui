import React, { useEffect } from "react";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import ServiceForm from './ServiceForm';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { fetchServiceDetails } from '../../../slices/vendor/serviceSlice';
import Spinner from "../../../shared/components/loaders/Spinner";
import PreventNavigation from "../../../shared/components/PreventNavigation";

const EditService = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { serviceDetails, isServiceDetailsLoading } = useSelector((state) => ({
        serviceDetails: state.vendorServices.serviceDetails || {},
        isServiceDetailsLoading: state.vendorServices.isServiceDetailsLoading,
    }));

    useEffect(() => {
            dispatch(fetchServiceDetails({ id, type: 'edit' }));
    }, [ dispatch]);

    return (
        <MasterLayout>
            <TabTitle title="Edit Service" />
            <Breadcrumb
                parent_menu="Service Management"
                parent_menu_url="/app/service-management"
                current_page="Edit Service"
            />
            <PreventNavigation />
            {isServiceDetailsLoading ? 
                <Spinner />
            : 
                <ServiceForm service={serviceDetails} isEdit={true} sId={id}/> 
            }
        </MasterLayout>
    )
};

export default EditService;
