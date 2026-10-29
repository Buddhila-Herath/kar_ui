import React, { useEffect } from "react";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import SparePartForm from './SparePartForm';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { fetchSparePartsDetailsForEdit } from '../../../slices/vendor/sparePartSlice';
import Spinner from "../../../shared/components/loaders/Spinner";
import PreventNavigation from "../../../shared/components/PreventNavigation";

const EditSparePart = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { sparePartDetails, isSparePartsLoading } = useSelector((state) => ({
        sparePartDetails: state.vendorSpareparts.sparePartDetails || {},
        isSparePartsLoading: state.vendorSpareparts.isSparePartsLoading,
    }));
    
    useEffect(() => {
        if (id) {
            dispatch(fetchSparePartsDetailsForEdit(id));
        }
    }, [id, dispatch]);

    return (
        <MasterLayout>
            <TabTitle title="Edit Spare Part" />
            <Breadcrumb
                parent_menu="Spare Part Management"
                parent_menu_url="/app/spare-parts-management"
                current_page="Edit Spare Part"
            />
            <PreventNavigation />
            {isSparePartsLoading ? 
                <Spinner />
            : 
                <SparePartForm sparePart={sparePartDetails} isEdit={true} sId={id} /> 
            }
        </MasterLayout>
    )
};

export default EditSparePart;
