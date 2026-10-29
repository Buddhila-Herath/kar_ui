import React, { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import  ClientForm from './ClientForm';
import { fetchClientEditViewById } from '../../../slices/vendor/clientSlice';
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const EditClient = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const client = useSelector((state) => state.vendorClients.clientsDetails, shallowEqual);
    const isClientLoading = useSelector((state) => state.vendorClients.isClientLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchClientEditViewById( id ));
        }
    }, [id, dispatch]);

    return (
        <MasterLayout>
            <TabTitle title="Edit Client" />
            <Breadcrumb
                parent_menu="Client Management"
                parent_menu_url="/app/client-management"
                current_page="Edit Client"
            />
            <TopProgressBar isLoading={isClientLoading} />
            {client ? 
                <ClientForm key={client?.id || "new"} client={client} isEdit={true} sId={id} /> 
            : 
                <Spinner />
            }
        </MasterLayout>
    );
};

export default EditClient;
