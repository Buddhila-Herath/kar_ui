import React, { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import InvoiceForm from './InvoiceForm';
import { fetchInvoiceDetails } from "../../../slices/vendor/financeSlice";
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { notification } from "antd";
import Icons from "../../../utils/icons";

const EditInvoice = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const invoiceDetails = useSelector((state) => state.vendorFinance.invoiceDetails, shallowEqual);
    const isInvoiceDetailsLoading = useSelector((state) => state.vendorFinance.isInvoiceDetailsLoading);

    useEffect(() => {
        if (invoiceDetails && invoiceDetails.isTaxInvoice) {
            notification.error({
              message: <h5>Cannot edit a completed or invoiced item.</h5>,
              icon: <img src={Icons.error} alt="Error" />,
              duration: 5,
            });
            navigate("/app/finance-management");
        }
    }, [invoiceDetails, navigate]);


    useEffect(() => {
        if (id) {
            dispatch(fetchInvoiceDetails({ id, type: 'edit' }));
        }
    }, [id, dispatch]);

    return (
        <MasterLayout>
            <TabTitle title="Edit Invoice" />
            <Breadcrumb
                parent_menu="Finanace Management"
                parent_menu_url="/app/finance-management"
                current_page="Edit Invoice"
            />
            <TopProgressBar isLoading={isInvoiceDetailsLoading} />
            {isInvoiceDetailsLoading ? 
                <Spinner />
            : 
                <InvoiceForm key={invoiceDetails?.id || "new"} invoice={invoiceDetails} isEdit={true} sId={id} /> 
            }            
        </MasterLayout>
    );
};

export default EditInvoice;
