import React, { useState } from "react";
import DeleteModel from "../../../shared/action-buttons/DeleteModel";
import { useDispatch } from 'react-redux';
import { deleteServices } from "../../../slices/vendor/serviceSlice";
import { notification } from 'antd';
import Icons from "../../../utils/icons";

const DeleteService = (props) => {
    const { onDelete, deleteModel, onClickDeleteModel, dataType, onDeleteSuccess } = props;
    const dispatch = useDispatch();
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteUserClick = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            const resultAction = await dispatch(deleteServices(onDelete.id));

            if (deleteServices.rejected.match(resultAction)) {

                notification.error({
                    message: <h5>Service cannot be deleted as a quote has been created using this service</h5>,
                    icon: <img src={Icons.error} alt="Error" />,
                    duration: 5,
                });
                onClickDeleteModel(false);
            } else {
                notification.success({
                    message: <h5>Deleted successfully!</h5>,
                    icon: <img src={Icons.check} alt="Success" />,
                    duration: 5
                });
                onDeleteSuccess(onDelete.id);
                onClickDeleteModel(false);
            }
        } catch (error) {
            console.error("Failed to delete:", error);
            onClickDeleteModel(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            {deleteModel && (
                <DeleteModel
                    onClickDeleteModel={onClickDeleteModel}
                    deleteModel={deleteModel}
                    deleteUserClick={deleteUserClick}
                    dataType={dataType}
                    id={onDelete.service_Id}
                    isProcessing={isDeleting}
                />
            )}
        </div>
    );
};

export default DeleteService;
