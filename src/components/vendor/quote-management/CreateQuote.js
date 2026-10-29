import React from 'react';
import MasterLayout from '../../MasterLayout';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import QuoteForm from './QuoteForm';
import PreventNavigation from "../../../shared/components/PreventNavigation";

const CreateQuote = () => {
    return (
        <MasterLayout>
            <TabTitle title="Create New Quote/Estimate" />
            <Breadcrumb
                parent_menu="Quote Management"
                parent_menu_url="/app/quote-management"
                current_page="Create New Quote/Estimate"
            />
            <PreventNavigation />
            <QuoteForm />
        </MasterLayout>
    )
};

export default CreateQuote;
