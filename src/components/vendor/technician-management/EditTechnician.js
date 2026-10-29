import React, { useEffect } from "react";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import TechnicianForm from './TechnicianForm';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { fetchTechnicianDetails } from '../../../slices/vendor/technicianSlice';
import Spinner from "../../../shared/components/loaders/Spinner";
import PreventNavigation from "../../../shared/components/PreventNavigation";

const EditTechnician = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { technician, isTechnicianDetailLoading } = useSelector((state) => ({
        technician: state.vendorTechnician.technicianDetails || {},
        isTechnicianDetailLoading: state.vendorTechnician.isTechnicianDetailLoading,
    }));

    useEffect(() => {
        if (id) {
            dispatch(fetchTechnicianDetails({ id, type: 'edit' }));
        }
    }, [id, dispatch]);

    return (
        <MasterLayout>
            <TabTitle title="Edit Technician" />
            <Breadcrumb
                parent_menu="Technician Management"
                parent_menu_url="/app/technician-management"
                current_page="Edit Technician"
            />
            <PreventNavigation />
            {isTechnicianDetailLoading ? 
                <Spinner />
            : 
                <TechnicianForm technician={technician} isEdit={true} sId={id} /> 
            }
        </MasterLayout>
    )
};

export default EditTechnician;
