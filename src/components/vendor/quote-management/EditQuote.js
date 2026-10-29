import React, { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import QuoteForm from './QuoteForm';
import { fetchQuoteDetails } from '../../../slices/vendor/quoteSlice';
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const EditQuote = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    
    const quote = useSelector((state) => state.vendorQuotes.quoteDetails, shallowEqual);
    const isQuoteDetailsLoading = useSelector((state) => state.vendorQuotes.isQuoteDetailsLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchQuoteDetails({ id, type: 'edit' }));
        }
    }, [id, dispatch]);

    return (
        <MasterLayout>
            <TabTitle title="Edit Quote/Estimate" />
            <Breadcrumb
                parent_menu="Quote Management"
                parent_menu_url="/app/quote-management"
                current_page="Edit Quote/Estimate"
            />
            <TopProgressBar isLoading={isQuoteDetailsLoading} />
            {quote ? 
                <QuoteForm key={quote?.id || "new"} quote={quote} isEdit={true} sId={id} /> 
            : 
                <Spinner />
            }
        </MasterLayout>
    );
};

export default EditQuote;
