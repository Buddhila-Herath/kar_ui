import React from 'react';
import { Tooltip, Dropdown } from 'antd';
import Icons from "../../utils/icons";

const ActionButton = (props) => {
    const { 
        goToEditData, 
        item, 
        onClickDeleteModel = true, 
        isDeleteMode = true, 
        isEditMode = true, 
        goToDetailScreen, 
        isViewIcon = false , 
        onDownloadItem, 
        isDownloadMode = true,
        isPrintMode = false,
        onClickPrint = true,
        isTaxInvoice = false,
        isInvoiceCreated=false,
        isCompleted=false,
        editDisabled = false,
        isDownloadPdfLoading = false
      } = props;

    const menuItems = [
        isViewIcon && {
            key: "view",
            label: (
                <Tooltip title="View" color="#000" placement="bottom" overlayStyle={{ zIndex: 3 }}>
                    <img
                        src={Icons.view}
                        onClick={(e) => {
                            e.stopPropagation();
                            goToDetailScreen(item.id);
                        }}
                        alt="View"
                    />
                </Tooltip>
            )
        },
        isEditMode && {
            key: "edit",
            label: (
                <Tooltip title="Edit" color="#000" placement="bottom" overlayStyle={{ zIndex: 3 }}>
                    <img
                        src={Icons.pencil_simple_line}
                        onClick={(e) => {
                            if (editDisabled) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }   
                            if (isTaxInvoice) return;
                            if (isInvoiceCreated) return;   
                            e.stopPropagation();
                            goToEditData(item);
                        }}
                        alt="Edit"
                        className={` ${editDisabled || isTaxInvoice || isInvoiceCreated || isCompleted  ? 'action-disabled disabled-form-item' : '' }`}
                        style={editDisabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                    />
                </Tooltip>
            )
        },
        isDeleteMode && {
            key: "delete",
            label: (
                <Tooltip title="Delete" color="#000" placement="bottom" overlayStyle={{ zIndex: 3 }}>
                    <img
                        src={Icons.trash_red}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickDeleteModel(item);
                        }}
                        alt="Delete"
                    />
                </Tooltip>
            )
        },
        isPrintMode && {
            key: "print",
            label: (
                <Tooltip title="Print" color="#000" placement="bottom">
                    <img
                        src={Icons.print}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickPrint(item);
                        }}
                        alt="Print"
                    />
                </Tooltip>
            )
        },
        isDownloadMode && {
            key: "download",
            label: (
                isDownloadPdfLoading ? (
                    <Tooltip title="Downloading..." color="#000" placement="bottom">
                    <img
                        src={Icons.spinner_blue} 
                        alt="Downloading..." 
                        className="download-icon spinner"
                    />
                    </Tooltip>
                ) : (
                    <Tooltip title="Download" color="#000" placement="bottom">
                        <img
                            src={Icons.download}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownloadItem(item);
                            }}
                            alt="Download"
                            className='download-icon'
                        />
                    </Tooltip>
                )
            )
        },
    ].filter(Boolean);

    return (
        <>
            <div className="action-buttons-desktop">
                {isViewIcon && (
                    <Tooltip title="View" color="#000" placement="bottom">
                        <img
                            src={Icons.view}
                            onClick={(e) => {
                                e.stopPropagation();
                                goToDetailScreen(item.id);
                            }}
                            alt="View"
                            id='view-btn'
                        />
                    </Tooltip>
                )}
                {isEditMode && (
                    <Tooltip title="Edit" color="#000" placement="bottom">
                        <img
                            src={Icons.pencil_simple_line}
                            onClick={(e) => {
                                if (editDisabled) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                }
                                if (isTaxInvoice) return;
                                if (isInvoiceCreated) return;                                
                                e.stopPropagation();
                                goToEditData(item);
                            }}
                            alt="Edit"
                           className={`edit-button ${editDisabled || isTaxInvoice || isInvoiceCreated || isCompleted ? 'action-disabled disabled-form-item' : '' }`}
                           id='edit-btn'
                        />
                    </Tooltip>
                )}
                {isDeleteMode && (
                    <Tooltip title="Delete" color="#000" placement="bottom">
                        <img
                            src={Icons.trash_red}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClickDeleteModel(item);
                            }}
                            alt="Delete"
                            id='delete-btn'
                        />
                    </Tooltip>
                )}
                {isPrintMode && (
                    <Tooltip title="Print" color="#000" placement="bottom">
                        <img
                            src={Icons.print}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClickPrint(item);
                            }}
                            alt="Print"
                            id='print-btn'
                        />
                    </Tooltip>
                )}
                {isDownloadMode && (
                    isDownloadPdfLoading ? (
                        <Tooltip title="Downloading..." color="#000" placement="bottom">
                        <img
                            src={Icons.spinner_blue} 
                            alt="Downloading..." 
                            className="spinner"
                            id='downloading-pdf-btn'
                        />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Download" color="#000" placement="bottom">
                            <img
                                src={Icons.download}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownloadItem(item);
                                }}
                                alt="Download"
                                className='download-icon'
                                id='download-pdf-btn'
                            />
                        </Tooltip>
                    )
                )}
            </div>
            <div className="action-buttons-mobile">
                <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement='bottomRight'
                    overlayClassName='mobile-actions'
                    id='three-dots-btn'
                >
                    <img src={Icons.three_dots} alt="Actions" />
                </Dropdown>
            </div>
        </>
    );
};

export default ActionButton;
