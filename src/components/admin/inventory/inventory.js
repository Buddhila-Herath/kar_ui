import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import { Filters } from "../../../constants";
import { renderSortIcons } from "../../../config/sortConfig";
import { Tooltip } from 'antd';
import Icons from "../../../utils/icons";
import { ViewInventory } from "./ViewInventory";
import { fetchAllInventoryServiceUpdate, fetchAllInventorySparePartsUpdate, fetchInventoryUpdatesCount } from "../../../slices/inventoryUpdateSlice";
import { useParams } from "react-router";

export const Inventory = () => {
  const dispatch = useDispatch();
  const { 
    isLoading, 
    data, 
    totalItems, 
    totalPages,
    servicesTotalItems,
    sparePartsTotalItems,
    inventoryUpdatesCount
  } = useSelector((state) => state.inventoryUpdate);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [filter, setFilter] = useState({
    page: Filters.OBJ.page,
    pageSize: Filters.OBJ.size,
    searchTerm: "",
    sortField: "",
    sortOrder: Filters.OBJ.order,
    modifiedBy: "",
    modifiedDate: "",
  });
  const [rowId, setRowId] = useState(null)
  const handleViewInventory = (row) => {
    setRowId(row.id)
    setShowInventoryModal(true)
  };
  const { tab } = useParams();
  const [inventoryType, setInventoryType] = useState(tab === 'spareparts' ? 1 : 0);

  useEffect(() => {
    dispatch(fetchInventoryUpdatesCount());
  }, [dispatch]);

  useEffect(() => {
    if (showInventoryModal) return;
    
    const payload = {
      page: filter.page,
      pageSize: filter.pageSize,
      searchTerm: filter.searchTerm,
      modifiedBy: filter.modifiedBy,
      modifiedDate: filter.modifiedDate,
    };

    if (inventoryType === 0) {
      // Services
      dispatch(fetchAllInventoryServiceUpdate(payload));
    } else if (inventoryType === 1) {
      // Spare Parts
      dispatch(fetchAllInventorySparePartsUpdate(payload));
    }
  }, [
    dispatch, 
    showInventoryModal, 
    inventoryType, 
    filter.page, 
    filter.pageSize, 
    filter.searchTerm, 
    filter.modifiedBy, 
    filter.modifiedDate
  ]);

  // Fire both APIs in parallel on filter changes to refresh tab counts without changing table rows
  useEffect(() => {
    const countPayload = {
      page: 1,
      pageSize: 1,
      searchTerm: filter.searchTerm,
      modifiedBy: filter.modifiedBy,
      modifiedDate: filter.modifiedDate,
      forCount: true,
    };
    dispatch(fetchAllInventoryServiceUpdate(countPayload));
    dispatch(fetchAllInventorySparePartsUpdate(countPayload));
  }, [dispatch, filter.searchTerm, filter.modifiedBy, filter.modifiedDate]);

  const onChange = (filters) => {
    setFilter((prevFilter) => {
      const newFilter = {
        ...prevFilter,
        ...filters,
      };
      if (JSON.stringify(prevFilter) !== JSON.stringify(newFilter)) {
        return newFilter;
      }
      return prevFilter;
    });
  };

  const customSort = (column, sortDirection) => {
    if (column) {
      setFilter((prevFilter) => ({
        ...prevFilter,
        sortField: column.sortField,
        sortOrder: sortDirection.toUpperCase(),
      }));
    }
  };

  const itemsValue = (data || []).map((item, index) => {
    const baseItem = {
      no: String((filter.page - 1) * filter.pageSize + index + 1).padStart(2, '0'),
      id: inventoryType === 0 ? item.serviceId : (item.productId || item.sparePartId),
      lastUpdated: item.formattedLastModifiedDateTime,
    };

    if (inventoryType === 0) {
      // Services data structure
      return {
        ...baseItem,
        itemCode: item.servicePrimaryIdentifier,
        itemName: item.serviceName,
        vendorName: Array.isArray(item.modifiedBy) ? item.modifiedBy.join(', ') : '',
      };
    } else {
      // Spare Parts data structure
      return {
        ...baseItem,
        itemCode: item.productPrimaryIdentifier,
        itemName: item.productName,
        vendorName: Array.isArray(item.modifiedBy) ? item.modifiedBy.join(', ') : '',
      };
    }
  });

  const columns = [
    {
      id: 1,
      name: "No",
      selector: (row) => row.no,
      sortable: false,
      maxWidth: '80px',
      minWidth: '64px',
    },
    {
      id: 2,
      name: `${inventoryType == 0 ? 'Service' : 'Spare Part'} Identifier`,
      selector: (row) => row.itemCode,
      sortField: "ITEM_CODE",
      sortable: false,
      maxWidth: "300px",
      minWidth: "210px",
      wrap: true,
    },
    {
      id: 3,
      name: `${inventoryType == 0 ? 'Service Name' : 'Spare Part'}`,
      selector: (row) => {
        if (!row.itemName) return null;
        const maxVisibleLength = 30;
        const isTruncated = row.itemName.length > maxVisibleLength;
        const visibleText = isTruncated
          ? `${row.itemName.slice(0, maxVisibleLength)}...`
          : row.itemName;

        return isTruncated ? (
          <Tooltip
            className="custom-tooltip"
            color="#E0EBFF"
            title={
              <div className="tooltip-content">
                <span className="badge">{row.itemName}</span>
              </div>
            }
            placement="bottom"
          >
            <span>{visibleText}</span>
          </Tooltip>
        ) : (
          <span>{row.itemName}</span>
        );
      },
      sortField: "ITEM_NAME",
      sortable: false,
      maxWidth: "400px",
      minWidth: "259.67px",
      wrap: true,
      grow: 2,
    },
    {
      id: 4,
      name: "Last Modified By",
      selector: (row) => {
        if (!row.vendorName) return null;
        const technicianNames = row.vendorName
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (technicianNames.length === 0) {
          return null;
        }
        const visibleTechnicianNames = technicianNames.slice(-1);
        const remainingTechnicianNames = technicianNames.slice(0, -1);
        return (
          <div className="business-type-badge-container">
            {visibleTechnicianNames.map((name, index) => (
              <Tooltip
                key={index}
                className="custom-tooltip"
                color="#E0EBFF"
                title={
                  <div className="tooltip-content">
                    <span className="badge">{name}</span>
                  </div>
                }
              >
                <span className="business-type-badge tech-badge">{name}</span>
              </Tooltip>
            ))}
            {remainingTechnicianNames.length > 0 && (
              <Tooltip
                className="custom-tooltip"
                color="#E0EBFF"
                title={
                  <div className="tooltip-content">
                    {remainingTechnicianNames.map((name, index) => (
                      <span key={index} className="badge">
                        {name}
                      </span>
                    ))}
                  </div>
                }
              >
                <span className="business-type-badge more-badge">
                  +{remainingTechnicianNames.length}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
      sortField: "vendorName",
      sortable: false,
      maxWidth: "400px",
      minWidth: "259.67px",
      wrap: true,
    },
    {
      id: 5,
      name: "Last Modified Date",
      selector: (row) => row.quantity,
      sortField: "QUANTITY",
      sortable: false,
      maxWidth: "400px",
      minWidth: "259.67px",
      cell: (row) => (
        <span>
          {row.lastUpdated}
        </span>
      ),
    },
    {
      id: 12,
      name: "",
      selector: (row) => row,
      sortable: false,
      maxWidth: "90px",
      minWidth: "79px !important",
      cell: (row) => (
        <div style={{ cursor: 'pointer', color: '#183571' }} id='inventory_action_button' className="actions inventory-actions" onClick={() => handleViewInventory(row)}>
          <span style={{ textDecoration: 'underline' }}>View </span><img src={Icons.arrowRightInventory} alt="View" />
        </div>
      ),
    },
  ];

  const totalRecordUnfiltered = (inventoryUpdatesCount.inventoryCounts + inventoryUpdatesCount.serviceCounts) || 0;
  const isFilterApplied = (
    (filter.searchTerm && String(filter.searchTerm).trim().length > 0) ||
    (Array.isArray(filter.modifiedBy) && filter.modifiedBy.length > 0) ||
    !!filter.modifiedDate
  );
  const totalRecord = isFilterApplied
    ? ((Number(servicesTotalItems) || 0) + (Number(sparePartsTotalItems) || 0))
    : totalRecordUnfiltered;
  const totalPagesLocal = totalPages || Math.ceil(totalRecord / filter.pageSize);

  const totalItemsForTabs = isFilterApplied
    ? {
        services: Number(servicesTotalItems) || 0,
        spareParts: Number(sparePartsTotalItems) || 0,
      }
    : {
        services: inventoryUpdatesCount.serviceCounts || 0,
        spareParts: inventoryUpdatesCount.inventoryCounts || 0,
      };

  const onCloseModal = () => {
    setShowInventoryModal(false)
  }

  const handleInventoryStatusChange = () => {
    const payload = {
      page: filter.page,
      pageSize: filter.pageSize,
      searchTerm: filter.searchTerm,
      modifiedBy: filter.modifiedBy,
      modifiedDate: filter.modifiedDate,
    };
    if (inventoryType === 0) {
      dispatch(fetchAllInventoryServiceUpdate(payload));
    } else {
      dispatch(fetchAllInventorySparePartsUpdate(payload));
    }
    dispatch(fetchInventoryUpdatesCount());
  }

  return (
    <MasterLayout>
      <Breadcrumb current_page="Inventory Management" />
      <TopProgressBar isLoading={isLoading} />
      <TabTitle title="Inventory Management" />
      <ReactDataTable
        columns={columns}
        tableTitle="Inventory Updates"
        countTextSingular="Record"
        countTextPlural="Records"
        filterTitle="Filter Inventory Updates"
        items={itemsValue}
        onChange={onChange}
        currentPage={filter.page}
        pageSize={filter.pageSize}
        isLoading={isLoading}
        isShowFilterField
        isShowSearch={true}
        totalRows={totalRecord}
        totalPages={totalPagesLocal}
        noDataText="Updates will appear here as soon as there’s something new."
        isExport={false}
        sortField={filter.sortField}
        sortOrder={filter.sortOrder}
        sortIcon={renderSortIcons()}
        isModifiedByFilter
        isModifiedDateFilter
        customSort={customSort}
        isFilterApplied={isFilterApplied}
        showtab={true}
        className={'inventory-table'}
        onTabChange={(tab) => { setInventoryType(tab) }}
        totalItemsForTabs={totalItemsForTabs}
        noRecordsMessage={<span>Updates will appear here as soon as there’s something new.</span>}
        noFilterMatchMessage="No data available for the selected filters. Please adjust your filters to view relevant data."
      />

      <ViewInventory
        open={showInventoryModal}
        closeModal={onCloseModal}
        rowId={rowId}
        inventoryType={inventoryType === 0 ? 'service' : 'sparePart'}
        onStatusChange={handleInventoryStatusChange}
      />
    </MasterLayout>
  );
};
