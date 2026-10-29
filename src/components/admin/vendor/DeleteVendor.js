import React from "react";
import DeleteModel from "../../../shared/action-buttons/DeleteModel";
import { getFormattedMessage } from '../../../shared/sharedMethod';
import { deleteVendorDetails } from '../../../slices/vendorSlice';
import { useDispatch } from 'react-redux';

const DeleteVendor = (props) => {
    const { onDelete, deleteModel, onClickDeleteModel } = props;
    const dispatch = useDispatch();

    const deleteUserClick = () => {
        dispatch(deleteVendorDetails(onDelete.id));
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && (
                <DeleteModel
                    onClickDeleteModel={onClickDeleteModel}
                    deleteModel={deleteModel}
                    deleteUserClick={deleteUserClick}
                    title={getFormattedMessage("vendor.title")}
                    name={getFormattedMessage("vendor.title")}
                />
            )}
        </div>
    );
};

export default DeleteVendor;
