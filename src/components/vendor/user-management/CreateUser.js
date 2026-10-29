import React from 'react';
import MasterLayout from '../../MasterLayout';
import {useNavigate} from 'react-router-dom';
import {Filters} from '../../../constants';
import UserForm from './UserForm';
import {placeholderText} from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import Breadcrumb from '../../../shared/breadcrumb/Breadcrumb';

const CreateUser = () => {
    const navigate = useNavigate();

    const addUserData = (formValue) => {
        addUser(formValue, navigate, Filters.OBJ);
    };

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("users.create.title")} />
            <Breadcrumb 
                parent_menu="User Management"
                parent_menu_url="/app/user-management"
                current_page="Add New User"
            />
            <UserForm addUserData={addUserData}/>
        </MasterLayout>
    )
};

export default CreateUser;
