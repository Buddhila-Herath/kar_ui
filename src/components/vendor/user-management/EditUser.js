import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import MasterLayout from '../../MasterLayout';
import UserForm from './UserForm';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';
import { fetchUserDetails } from '../../../slices/vendor/userSlice';
import PreventNavigation from "../../../shared/components/PreventNavigation";
import Spinner from "../../../shared/components/loaders/Spinner";
import { placeholderText } from '../../../shared/sharedMethod';

const EditUser = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.users.userDetails || {});
    const isUserDetailsLoading = useSelector((state) => state.users.isUserDetailsLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchUserDetails({ id, type: 'edit' }));
        }
    }, [id, dispatch]);

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("users.create.edit")} />
            <Breadcrumb 
                parent_menu="User Management"
                parent_menu_url="/app/user-management"
                current_page="Edit User"
            />
            <PreventNavigation />
            {isUserDetailsLoading ? 
                <Spinner />
            : 
                <UserForm user={user} isEdit={true} sId={id} /> 
            }
        </MasterLayout>
    )
};

export default EditUser;
