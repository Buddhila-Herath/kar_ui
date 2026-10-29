import React from "react";
import DeleteModel from "../../../shared/action-buttons/DeleteModel";
import { 
    deleteQuoteSparePartOrService,
    deleteQuoteExistingSparePart,
    deleteQuoteExistingService
} from "../../../slices/vendor/quoteSlice";
import { useDispatch } from 'react-redux';
import { notification } from 'antd';
import Icons from "../../../utils/icons";

const DeleteSparePartService = (props) => {
    const { 
        onDelete, 
        deleteModel, 
        onClickDeleteModel, 
        dataType, 
        onDeleteSuccess,
        tempLinkedSpareParts,
        processLinkedSpareParts
    } = props;
    const dispatch = useDispatch();

    const deleteUserClick = async () => {
        if(onDelete.isExisting) {
            try {
                if(onDelete.type === 'sparePart') {
                    const linkedSparePartExists = tempLinkedSpareParts.some(change => change.sparePartId === onDelete.id);

                    if (linkedSparePartExists) {
                        try {
                            await processLinkedSpareParts();
                        } catch (error) {
                            console.error("Failed to process linked spare parts:", error);
                            notification.error({
                                message: <h5>Failed to update linked spare parts. Deletion aborted.</h5>,
                                icon: <img src={Icons.error} alt="Error" />,
                                duration: 5,
                            });
                            return;
                        }
                    }
                    const resultAction = await dispatch(deleteQuoteExistingSparePart({
                        partId: onDelete.id,
                        quoteId: onDelete.quote_id,
                    }));

                    if (deleteQuoteExistingSparePart.rejected.match(resultAction)) {
                        const errorMessage = resultAction.payload || "Something went wrong. Please try again.";
                        
                        notification.error({
                            message: <h5>{errorMessage}</h5>,
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
                } else {
                    const resultAction = await dispatch(deleteQuoteExistingService({
                        serviceId: onDelete.id,
                        quoteId: onDelete.quote_id,
                    }));
                    if (deleteQuoteExistingService.rejected.match(resultAction)) {
                        const errorMessage = resultAction.payload || "Something went wrong. Please try again.";
                        
                        notification.error({
                            message: <h5>{errorMessage}</h5>,
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
                }
            } catch (error) {
                console.error("Failed to delete:", error);
                notification.error({
                    message: <h5>Something went wrong. Please try again.</h5>,
                    icon: <img src={Icons.error} alt="Error" />,
                    duration: 5,
                });
            }
        } else {
            try {
                const resultAction = await dispatch(deleteQuoteSparePartOrService({
                    type: onDelete.type === 'sparePart' ? "partsQuoteId" : "serviceQuoteId",
                    id: onDelete.id,
                    isService: onDelete.type === 'sparePart' ? false : true,
                }));
                
                if (deleteQuoteSparePartOrService.rejected.match(resultAction)) {
                    const errorMessage = resultAction.payload || "Something went wrong. Please try again.";
                    
                    notification.error({
                        message: <h5>{errorMessage}</h5>,
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
                notification.error({
                    message: <h5>Something went wrong. Please try again.</h5>,
                    icon: <img src={Icons.error} alt="Error" />,
                    duration: 5,
                });
            }
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
                />
            )}
        </div>
    );
};

export default DeleteSparePartService;
