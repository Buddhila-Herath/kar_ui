import { useState, useEffect, useRef, useMemo } from "react";
import Icons from "../../utils/icons";
import { useDispatch, useSelector } from "react-redux";
import { Carousel } from "antd";
import Spinner from "../../shared/components/loaders/Spinner";
import { Link } from "react-router-dom";
import { fetchRecentInventoryUpdateData, fetchRecentInventoryUpdateSparePartsData } from "../../slices/admin/adminDashBoardDataSlice";
import { ViewInventory } from "../admin/inventory/ViewInventory";

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const InventoryUpdatesWidget = () => {
  const dispatch = useDispatch();
  const [widgetData, setWidgetData] = useState([])
  const carouselRef = useRef(null);
  const [activeMainTab, setActiveMainTab] = useState(0);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [rowId, setRowId] = useState(null);
  
  const { isRecentInventoryUpdateDataLoading, recentInventoryUpdateData, recentInventoryUpdateSparePartData, isRecentInventoryUpdateSparePartDataLoading } =
    useSelector((state) => state.adminDashBoardData);

  const inventoryUpdates = recentInventoryUpdateData?.data || [];
  const sparePartsUpdates = recentInventoryUpdateSparePartData?.data || [];

  const groupedInventoryUpdates = useMemo(
    () => chunkArray(inventoryUpdates, 5),
    [inventoryUpdates]
  );

  const groupedSparePartsInventoryUpdates = useMemo(
    () => chunkArray(sparePartsUpdates, 5),
    [sparePartsUpdates]
  );

  const handleMainTabClick = (tab) => {
    setActiveMainTab(tab);
    if (tab === 0) {
      setWidgetData(groupedInventoryUpdates)
    } else {
      setWidgetData(groupedSparePartsInventoryUpdates)
    }
  };

  useEffect(() => {
    dispatch(fetchRecentInventoryUpdateData({ page: "1", size: "15" }));
    dispatch(fetchRecentInventoryUpdateSparePartsData({ page: "1", size: "15" }));
  }, [dispatch]);

  useEffect(() => {
    if (activeMainTab === 0 && groupedInventoryUpdates.length > 0) {
      setWidgetData(groupedInventoryUpdates);
    } else if (activeMainTab === 1 && groupedSparePartsInventoryUpdates.length > 0) {
      setWidgetData(groupedSparePartsInventoryUpdates);
    }
  }, [groupedInventoryUpdates, groupedSparePartsInventoryUpdates, activeMainTab]);

  const formatNameList = (names = []) => {
    if (!Array.isArray(names) || names.length === 0) return '';
    return names.length > 1 ? `${names[names.length - 1]} and +${names.length - 1} ${(names.length - 1) > 1 ? 'Vendors' : 'Vendor'}` : names[0];
  }

  const handleViewInventory = (item) => {
    const serviceId = item?.serviceId ?? item?.serviceID ?? item?.id;
    const sparePartId = item?.sparePartId ?? item?.productId ?? item?.productID ?? item?.id;
    if (!serviceId && !sparePartId) return;

    const id = activeMainTab === 0 ? serviceId : sparePartId;
    setRowId(id);
    setShowInventoryModal(true);
  };

  const handleStatusChange = () => {
    dispatch(fetchRecentInventoryUpdateData({ page: "1", size: "15" }));
    dispatch(fetchRecentInventoryUpdateSparePartsData({ page: "1", size: "15" }));
  };

  const currentData = activeMainTab === 0 ? inventoryUpdates : sparePartsUpdates;
  const isLoading = activeMainTab === 0 ? isRecentInventoryUpdateDataLoading : isRecentInventoryUpdateSparePartDataLoading;

  const renderItemContent = (data) => {
    if (activeMainTab === 0) {
      return (
        <>
          <div className="vendor-details">
            <p className="vendor-email">
              #{data.servicePrimaryIdentifier}
            </p>
            <h5 className="vendor-name">
              {data.serviceName} service has been updated by {formatNameList(data.modifiedBy)}
            </h5>
            <p className="vendor-email">
              Modified on {data.formattedLastModifiedDateTime}
            </p>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="vendor-details">
            <p className="vendor-email">
              #{data.productPrimaryIdentifier}
            </p>
            <h5 className="vendor-name">
              {data.productName} spare part has been updated by {formatNameList(data.modifiedBy)}
            </h5>
            <p className="vendor-email">
              Modified on {data.formattedLastModifiedDateTime}
            </p>
          </div>
        </>
      );
    }
  };

  return (
    <div className="recent-vendors-container inventory-widget-container">
      <div className="recent-vendors-header">
        <h4>Inventory Updates</h4>
        <div className="job-container tech-jobs">
          <div className="job-tab-header">
            <div
              id="services-tab"
              className={`tab-item ${activeMainTab === 0 ? "active" : ""}`}
              onClick={() => handleMainTabClick(0)}
            >
              <span>Services</span>
            </div>
            <div
              id="spare-parts-tab"
              className={`tab-item ${activeMainTab === 1 ? "active" : ""}`}
              onClick={() => handleMainTabClick(1)}
            >
              <span>Spare Parts</span>
            </div>
          </div>
        </div>
        <Link to={`/admin/inventory-updates/${activeMainTab === 0 ? 'service' : 'spareparts'}`}>
          <img src={Icons.squar_out} alt="View All" />
        </Link>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className={`vendor-list ${currentData && currentData.length <= 5 ? 'no-slide' : ''}`}>
          {
            widgetData && widgetData.length > 0 && widgetData.some(group => group.length > 0) ? (
              <Carousel
                ref={carouselRef}
                dots={true}
                autoplaySpeed={5000}
              >
                {widgetData.map((group, index) => (
                  <div className="vendor-slide" key={index}>
                    {group.map((data, idx) => {
                      const itemKey = activeMainTab === 0
                        ? (data?.serviceId ?? data?.serviceID ?? data?.id ?? idx)
                        : (data?.sparePartId ?? data?.productId ?? data?.productID ?? data?.id ?? idx);
                      return (
                        <div 
                          className="vendor-item" 
                          key={itemKey} 
                          onClick={() => handleViewInventory(data)}
                        >
                          <div className="vender-item-img-name-wrapper">
                            {renderItemContent(data)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
                )}
              </Carousel>
            ) : (
              <div className="widget-no-data">
                <img src={Icons.warning_octagon} alt="No data" />
                <div className="no-data-text">No Updates available</div>
                <span className="no-data-message">
                  Updates will appear here as soon as there’s something new.
                </span>
              </div>)
          }
        </div>
      )}
      <ViewInventory
        open={showInventoryModal}
        closeModal={() => setShowInventoryModal(false)}
        rowId={rowId}
        onStatusChange={handleStatusChange}
        inventoryType={activeMainTab === 0 ? 'service' : 'sparepart'}
      />
    </div>
  );
};

export default InventoryUpdatesWidget;