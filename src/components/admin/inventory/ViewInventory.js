import { Modal, notification, Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import { Collapse } from "antd";
import Icons from '../../../utils/icons';
import { ConfirmationModal } from './ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '../../../shared/components/loaders/Spinner';
import { fetchInventoryUpdateViewById, updateInventoryStatus , fetchSparePartInventoryUpdateViewById, updateInventorySparePartStatus } from '../../../slices/inventoryUpdateSlice';

export const ViewInventory = ({ open, closeModal, rowId, onStatusChange, inventoryType = 'service' }) => {
  const dispatch = useDispatch()
  const handleClose = () => {
    closeModal();
  }
  const { 
    isInventoryByIdViewLoading, 
    viewInventoryDataById, 
    isSparePartInventoryByIdViewLoading,
    viewSparePartInventoryDataById,
    error 
  } = useSelector((state) => state.inventoryUpdate);

  const [viewInventoryById, setViewInventoryById] = useState(null);

  useEffect(() => {
    if (!open || !rowId) return;
    if (inventoryType === 'service') {
      dispatch(fetchInventoryUpdateViewById(rowId));
    } else {
      dispatch(fetchSparePartInventoryUpdateViewById(rowId));
    }
  }, [dispatch, open, rowId, inventoryType])

  const displaySectionLabel = (key) => {
    const map = {
      description: 'Description',
      material: 'Material',
      unitAndQuantityOfPurchase: 'Unit and Quantity of Purchase',
      unitAndQuantityOfSales: 'Unit and Quantity of Sales',
      purchasePrice: 'Purchase Price (Rs.)',
      salePriceMRP: 'Sale Price - MRP (Rs.)',
      stockStatus: 'Stock Status',
      variation: 'Variation',
      minimumOrderQuantitySupplier: 'Minimum Order Quantity - Supplier',
      hours: 'Hours',
      additionalCost: 'Additional Cost',
    };
    return map[key] || key;
  };

  useEffect(() => {
    const src = inventoryType === 'service' ? viewInventoryDataById : viewSparePartInventoryDataById;
    if (src) {
      const dataWithStatus = {
        ...src,
        description: src?.description?.map((item) => ({ ...item, status: 'pending' })) || [],
        variation: src?.variation?.map((item) => ({ ...item, status: 'pending' })) || [],
        hours: src?.hours?.map((item) => ({ ...item, status: 'pending' })) || [],
        additionalCost: src?.additionalCost?.map((item) => ({ ...item, status: 'pending' })) || [],
        // Spare-part sections
        material: src?.material?.map((item) => ({ ...item, status: 'pending' })) || [],
        unitAndQuantityOfPurchase: src?.unitAndQuantityOfPurchase?.map((item) => ({ ...item, status: 'pending' })) || [],
        unitAndQuantityOfSales: src?.unitAndQuantityOfSales?.map((item) => ({ ...item, status: 'pending' })) || [],
        purchasePrice: src?.purchasePrice?.map((item) => ({ ...item, status: 'pending' })) || [],
        salePriceMRP: src?.salePriceMRP?.map((item) => ({ ...item, status: 'pending' })) || [],
        minimumOrderQuantitySupplier: src?.minimumOrderQuantitySupplier?.map((item) => ({ ...item, status: 'pending' })) || [],
        stockStatus: src?.stockStatus?.map((item) => ({ ...item, status: 'pending' })) || [],
      };
      setViewInventoryById(dataWithStatus);
    }
  }, [inventoryType, viewInventoryDataById, viewSparePartInventoryDataById]);

  const handleStatusChange = async (action, section) => {
    if (!section || !viewInventoryById || !Array.isArray(viewInventoryById[section])) return;
    const index = viewInventoryById[section].findIndex((req) => req.requestId === singleData.requestId)
    const item = viewInventoryById[section][index];
    if (item.status !== 'pending') return;
    const updatedData = { ...viewInventoryById };
    if (action === 'accept') {
      updatedData[section] = updatedData[section].map((mod, i) => ({
        ...mod,
        status: i === index ? 'approved' : 'rejected',
      }));
    } else if (action === 'reject') {
      updatedData[section][index].status = 'rejected'
    }

    setViewInventoryById(updatedData);

    try {
      const thunk = inventoryType === 'service' ? updateInventoryStatus : updateInventorySparePartStatus;
      await dispatch(
        thunk({
          id: item.requestId,
          status: action == 'accept' ? "true" : "false",
        })
      ).unwrap();
      if (action == 'accept') {
        notification.success({
          message: <h5>{`"${displaySectionLabel(section)}" field update has been approved in ${getInventoryIdentifier()}`}</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });
      } else {
        notification.error({
          message: <h5>{`"${displaySectionLabel(section)}" field update has been rejected in ${getInventoryIdentifier()}`}</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });

      }
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      notification.error({
        message: <h5>Update Failed</h5>,
        icon: <img src={Icons.warning_circle} alt="Error" />,
        duration: 5,
      });
      const revertedData = { ...viewInventoryById };
      revertedData[section][index].status = 'pending';
      setViewInventoryById(revertedData);
    } finally {
      setType(null)
      setSingleData(null)
    }
  };

  const onModalOk = (e) => {
    setType(e);
    setShowModal(false)
    if (e && selectedSection) {
      handleStatusChange(e, selectedSection)
    }
  }

  const [type, setType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [singleData, setSingleData] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleReject = (modification, section) => {
    if (modification.status != "pending") return
    setType('reject');
    setShowModal(true);
    setSingleData(modification)
    setSelectedSection(section)
  }

  const handleApprove = (modification, section) => {
    if (modification.status != "pending") return
    setType('accept');
    setShowModal(true);
    setSingleData(modification)
    setSelectedSection(section)
  }

  const getInventoryIdentifier = () => {
    return inventoryType === 'service' 
      ? viewInventoryById?.serviceIdentifier 
      : viewInventoryById?.sparePartIdentifier;
  };

  const getInventoryName = () => {
    return inventoryType === 'service' 
      ? viewInventoryById?.serviceName 
      : viewInventoryById?.sparePartName;
  };

  return (
    <Modal
      title={(<div className='inventory-item-header'>
        <div className='inventory-item-code'>
          {viewInventoryById && getInventoryIdentifier()}
        </div>
        <div className='inventory-item-name'>
          {viewInventoryById && getInventoryName()}
        </div>
      </div>
      )}
      open={open}
      footer={null}
      width={796}
      height={516}
      centered={true}
      onCancel={handleClose}
      className="add-modal quote pause-modal view-inventory-modal"
      maskClosable={false}
    >
      { (inventoryType === 'service' ? isInventoryByIdViewLoading : isSparePartInventoryByIdViewLoading) && <Spinner /> }
      {
        (!(inventoryType === 'service' ? isInventoryByIdViewLoading : isSparePartInventoryByIdViewLoading) && viewInventoryById) &&
        < div>
          {
            viewInventoryById && viewInventoryById?.description && viewInventoryById?.description.length > 0 &&
            <>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Description"} className='inventory-collapse-panel'>
                  {viewInventoryById?.description.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (<div className='modification-status-approved'>
                          <div className='modification-date modification-date-mobile'>
                            Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                          </div>
                          <div className='status-approved'>Approved</div>
                        </div>
                        ) : (<div className='modification-status modification-status-not-approved'>
                          <div className='modification-date modification-date-mobile'>
                            Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                          </div>
                          <div className='modification-status-buttons'>
                            <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'description')} id='view_inventory_approve_button' /></div>
                            <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'description')} id='view_inventory_reject_button' /></div>
                          </div>
                        </div>)}
                      </div>
                      {(index < viewInventoryById?.description.length - 1) &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
              {(
                viewInventoryById?.variation && viewInventoryById?.variation.length > 0 ||
                viewInventoryById?.hours && viewInventoryById?.hours.length > 0 ||
                viewInventoryById?.additionalCost && viewInventoryById?.additionalCost.length > 0 ||
                viewInventoryById?.material && viewInventoryById?.material.length > 0 ||
                viewInventoryById?.unitAndQuantityOfPurchase && viewInventoryById?.unitAndQuantityOfPurchase.length > 0 ||
                viewInventoryById?.unitAndQuantityOfSales && viewInventoryById?.unitAndQuantityOfSales.length > 0 ||
                viewInventoryById?.stockStatus && viewInventoryById?.stockStatus.length > 0||
                viewInventoryById?.purchasePrice && viewInventoryById?.purchasePrice.length > 0||
                viewInventoryById?.salePriceMRP && viewInventoryById?.salePriceMRP.length > 0||
                viewInventoryById?.minimumOrderQuantitySupplier && viewInventoryById?.minimumOrderQuantitySupplier.length > 0
                ) && <div style={{ border: "1px solid #E4EAF2" }}></div>}
            </>
          }
          {
            inventoryType === 'service' && viewInventoryById && viewInventoryById?.variation && viewInventoryById?.variation.length > 0 &&
            <>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Variation"} className='inventory-collapse-panel'>
                  {viewInventoryById && viewInventoryById?.variation && viewInventoryById?.variation.length > 0 && viewInventoryById?.variation.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (<div className='modification-status-approved'>
                          <div className='modification-date modification-date-mobile'>
                            Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                          </div>
                          <div className='status-approved'>Approved</div>
                        </div>
                        ) : (<div className='modification-status modification-status-not-approved'>
                          <div className='modification-date modification-date-mobile'>
                            Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                          </div>
                          <div className='modification-status-buttons'>
                            <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'variation')} id='view_inventory_approve_button' /></div>
                            <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'variation')} id='view_inventory_reject_button' /></div>
                          </div>
                        </div>)}
                      </div>
                      {index < viewInventoryById?.variation.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
              {(
                viewInventoryById?.hours && viewInventoryById?.hours.length > 0 ||
                viewInventoryById?.additionalCost && viewInventoryById?.additionalCost.length > 0) && <div style={{ border: "1px solid #E4EAF2" }}></div>}
            </>
          }
          {
            viewInventoryById && viewInventoryById?.hours && viewInventoryById?.hours.length > 0 &&
            <>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Hours"} className='inventory-collapse-panel'>
                  {viewInventoryById && viewInventoryById?.hours && viewInventoryById?.hours.length > 0 && viewInventoryById?.hours.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (<div className='modification-status-approved'>
                          <div className='modification-date modification-date-mobile'>
                            Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                          </div>
                          <div className='status-approved'>Approved</div>
                        </div>
                        ) : (<div className='modification-status modification-status-not-approved'>
                          <div className='modification-date modification-date-mobile'>
                            Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                          </div>
                          <div className='modification-status-buttons'>
                            <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'hours')} id='view_inventory_approve_button' /></div>
                            <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'hours')} id='view_inventory_reject_button' /></div>
                          </div>
                        </div>)}
                      </div>
                      {index < viewInventoryById?.hours.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
              {viewInventoryById?.additionalCost && viewInventoryById?.additionalCost.length > 0 && <div style={{ border: "1px solid #E4EAF2" }}></div>}
            </>
          }
          {
            viewInventoryById && viewInventoryById?.additionalCost && viewInventoryById?.additionalCost.length > 0 &&
            <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
              isActive ? (
                <img src={Icons.CaretUp_inventory} />
              ) : (
                <img src={Icons.CaretDown_inventory} />
              )}>
              <Collapse.Panel header={"Additional Cost"} className='inventory-collapse-panel'>
                {viewInventoryById && viewInventoryById?.additionalCost && viewInventoryById?.additionalCost.length > 0 && viewInventoryById?.additionalCost.map((modification, index) => (
                  <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                    <div className='vendor-name'>
                      Vendor - {modification?.vendorName}
                    </div>
                    <div className='modification-date modification-date-desktop'>
                      Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                    </div>
                    <div className='modification-row'>
                      <div className='modification-values'>
                        <div className='old-value'>{modification?.oldValue}</div>
                        <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                        <div className='new-value'>{modification?.newValue}</div>
                      </div>
                      {modification?.status == 'approved' ? (<div className='modification-status-approved'>
                        <div className='modification-date modification-date-mobile'>
                          Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                        </div>
                        <div className='status-approved'>Approved</div>
                      </div>
                      ) : (<div className='modification-status modification-status-not-approved'>
                        <div className='modification-date modification-date-mobile'>
                          Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                        </div>
                        <div className='modification-status-buttons'>
                          <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'additionalCost')} id='view_inventory_approve_button' /></div>
                          <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'additionalCost')} id='view_inventory_reject_button' /></div>
                        </div>
                      </div>)}
                    </div>
                    {index < viewInventoryById?.additionalCost.length - 1 &&
                      <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                  </div>
                ))}
              </Collapse.Panel>
            </Collapse>
          }
          {
            viewInventoryById && viewInventoryById?.material && viewInventoryById?.material.length > 0 &&
            <>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Material"} className='inventory-collapse-panel'>
                  {viewInventoryById?.material.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'material')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'material')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.material.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

          {viewInventoryById && viewInventoryById?.stockStatus && viewInventoryById?.stockStatus.length > 0 &&
            <>
              <div style={{ border: "1px solid #E4EAF2" }}></div>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Stock Status"} className='inventory-collapse-panel'>
                  {viewInventoryById?.stockStatus.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'stockStatus')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'stockStatus')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.stockStatus.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

          {inventoryType !== 'service' && viewInventoryById && viewInventoryById?.variation && viewInventoryById?.variation.length > 0 &&
            <>
              <div style={{ border: "1px solid #E4EAF2" }}></div>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Variation"} className='inventory-collapse-panel'>
                  {viewInventoryById?.variation.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'variation')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'variation')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.variation.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

          {viewInventoryById && viewInventoryById?.unitAndQuantityOfPurchase && viewInventoryById?.unitAndQuantityOfPurchase.length > 0 &&
            <>
              <div style={{ border: "1px solid #E4EAF2" }}></div>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Unit and Quantity of Purchase"} className='inventory-collapse-panel'>
                  {viewInventoryById?.unitAndQuantityOfPurchase.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'unitAndQuantityOfPurchase')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'unitAndQuantityOfPurchase')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.unitAndQuantityOfPurchase.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

          {viewInventoryById && viewInventoryById?.unitAndQuantityOfSales && viewInventoryById?.unitAndQuantityOfSales.length > 0 &&
            <>
              <div style={{ border: "1px solid #E4EAF2" }}></div>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Unit and Quantity of Sales"} className='inventory-collapse-panel'>
                  {viewInventoryById?.unitAndQuantityOfSales.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'unitAndQuantityOfSales')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'unitAndQuantityOfSales')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.unitAndQuantityOfSales.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

          {viewInventoryById && viewInventoryById?.purchasePrice && viewInventoryById?.purchasePrice.length > 0 &&
            <>
              <div style={{ border: "1px solid #E4EAF2" }}></div>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Purchase Price (Rs.)"} className='inventory-collapse-panel'>
                  {viewInventoryById?.purchasePrice.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'purchasePrice')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'purchasePrice')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.purchasePrice.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

          {viewInventoryById && viewInventoryById?.salePriceMRP && viewInventoryById?.salePriceMRP.length > 0 &&
            <>
              <div style={{ border: "1px solid #E4EAF2" }}></div>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Sale Price - MRP (Rs.)"} className='inventory-collapse-panel'>
                  {viewInventoryById?.salePriceMRP.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'salePriceMRP')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'salePriceMRP')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.salePriceMRP.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

          {viewInventoryById && viewInventoryById?.minimumOrderQuantitySupplier && viewInventoryById?.minimumOrderQuantitySupplier.length > 0 &&
            <>
              <div style={{ border: "1px solid #E4EAF2" }}></div>
              <Collapse className='collapse-inventory' id='view_inventory_accorddion' expandIconPosition='end' ghost={true} expandIcon={({ isActive }) =>
                isActive ? (
                  <img src={Icons.CaretUp_inventory} />
                ) : (
                  <img src={Icons.CaretDown_inventory} />
                )}>
                <Collapse.Panel header={"Minimum Order Quantity - Supplier"} className='inventory-collapse-panel'>
                  {viewInventoryById?.minimumOrderQuantitySupplier.map((modification, index) => (
                    <div key={modification?.requestId} className={modification?.status ? modification?.status : ''}>
                      <div className='vendor-name'>
                        Vendor - {modification?.vendorName}
                      </div>
                      <div className='modification-date modification-date-desktop'>
                        Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                      </div>
                      <div className='modification-row'>
                        <div className='modification-values'>
                          <div className='old-value'>{modification?.oldValue}</div>
                          <img className='arrow-icon-inventory' src={Icons.arrowRightInventory} />
                          <div className='new-value'>{modification?.newValue}</div>
                        </div>
                        {modification?.status == 'approved' ? (
                          <div className='modification-status-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='status-approved'>Approved</div>
                          </div>
                        ) : (
                          <div className='modification-status modification-status-not-approved'>
                            <div className='modification-date modification-date-mobile'>
                              Modified on {modification?.displayModifiedDate} | {modification?.displayModifiedTime}
                            </div>
                            <div className='modification-status-buttons'>
                              <div><img src={Icons.inventory_approve} onClick={() => handleApprove(modification, 'minimumOrderQuantitySupplier')} id='view_inventory_approve_button' /></div>
                              <div><img src={Icons.inventory_reject} onClick={() => handleReject(modification, 'minimumOrderQuantitySupplier')} id='view_inventory_reject_button' /></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < viewInventoryById?.minimumOrderQuantitySupplier.length - 1 &&
                        <div style={{ border: "1px solid #E4EAF2", marginTop: "16px", marginBottom: "16px" }}></div>}
                    </div>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </>
          }

        </div>
      }
      <ConfirmationModal onUpdateModalOk={(e) => onModalOk(e)} isProcessing={false} type={type} visible={!!showModal} onClose={() => {
        setType(null);
        setShowModal(false);
        setSingleData(null)
        setSelectedSection(null)
      }} />
    </Modal>
  )
}
