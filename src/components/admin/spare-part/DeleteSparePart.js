import React, { useState } from "react";
import DeleteModel from "../../../shared/action-buttons/DeleteModel";
import { deleteSparePartDetails } from "../../../slices/vendor/sparePartSlice";
import { useDispatch } from 'react-redux';
import { notification } from 'antd';
import Icons from "../../../utils/icons";

const DeleteSparePart = (props) => {
    const { onDelete, deleteModel, onClickDeleteModel, dataType } = props;
    const dispatch = useDispatch();
    const [isDeleting, setIsDeleting] = useState(false);

     const deleteUserClick = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
            try {
                const resultAction = await dispatch(deleteSparePartDetails(onDelete.id));
    
                if (deleteSparePartDetails.rejected.match(resultAction)) {
    
                    notification.error({
                        message: <h5>Spare part cannot be deleted as a quote has been created using this product</h5>,
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
                    id={onDelete.spare_id}
                    isProcessing={isDeleting}
                />
            )}
        </div>
    );
};

export default DeleteSparePart;
