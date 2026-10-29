import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Table, Tooltip, notification } from "antd";
import StatusDropDown from "../../../shared/select/StatusDropDown";
import TableRadioSelect from "../../../shared/select/TableRadioSelect";
import Icons from "../../../utils/icons";
import PausedReasonModal from "./PausedReasonModal";
import { updateJobStatus, getTechnicianNames, assignUniversalTechnician } from "../../../slices/vendor/jobSlice";

const statusOptions = [
  { label: "", value: "" },
  { label: "Started", value: "Started" },
  { label: "Paused", value: "Paused" },
  { label: "Completed", value: "Completed" },
];

const ServiceDataTable = ({
  jobId,
  serviceData,
  onAssignTechnicianClick,
  onClickPauseReasonModelOpen,
  handleQuoteServiceId,
  handleJobDetailsData,
  universalJobStatus,
  isDisabled = false,
  onRefetchServiceDetails
}) => {

  const dispatch = useDispatch();
  const [isPausedReasonModalVisible, setIsPausedReasonModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [technicianLists, setTechnicianLists] = useState({});
  const [loadingTechnicians, setLoadingTechnicians] = useState({});
  const shownErrorCategories = useRef(new Set());

  useEffect(() => {
    if (!serviceData || serviceData.length === 0) return;

    const fetchTechniciansForCategories = async () => {
      const uniqueCategories = [...new Set(serviceData.map(item => item.serviceCategoryId))];

      for (const categoryId of uniqueCategories) {
        // Skip if already loading or loaded
        if (loadingTechnicians[categoryId] || technicianLists[categoryId]) continue;

        try {
          setLoadingTechnicians(prev => ({ ...prev, [categoryId]: true }));
          const technicians = await dispatch(getTechnicianNames(categoryId)).unwrap();
          setTechnicianLists(prev => ({
            ...prev,
            [categoryId]: technicians.map(tech => ({
              label: tech.technicianName,
              value: tech.id
            }))
          }));
        } catch (error) {
          if (!shownErrorCategories.current.has(categoryId)) {
            notification.error({
              message: <h5>No active technicians available right now!</h5>,
              description: error.message || "Please try again later",
              icon: <img src={Icons.error} alt="Error" />,
            });
            shownErrorCategories.current.add(categoryId);
          }
        } finally {
          setLoadingTechnicians(prev => ({ ...prev, [categoryId]: false }));
        }
      }
    };

    fetchTechniciansForCategories();
  }, [dispatch, serviceData]);

  const handleAssignTechnician = async (serviceCategoryId, technicianId) => {
    try {
      const response = await dispatch(assignUniversalTechnician({
        jobId,
        serviceCategoryId,
        universalTechnicianId: technicianId
      })).unwrap();

      if (response) {
        notification.success({
          message: <h5>Universal technician assigned successfully</h5>,
          icon: <img src={Icons.check} alt="Success" />,
        });
        // Refetch only service details instead of full job details
        if (onRefetchServiceDetails) {
          await onRefetchServiceDetails();
        }
      }
    } catch (error) {
      notification.error({
        message: <h5>Failed to assign universal technician</h5>,
        description: error.message || "Please try again",
        icon: <img src={Icons.error} alt="Error" />,
      });
    }
  };

  const onClickAssignTechnicianModel = (serviceCategoryId, assistantTechnicians, main_technician) => {
    const techniciansForCategory = technicianLists[serviceCategoryId] || [];
    onAssignTechnicianClick(
      techniciansForCategory,
      serviceCategoryId,
      assistantTechnicians,
      main_technician,
    );
  };

  const downloadChecklist = (checkList, index) => {
    if (!checkList || checkList.length === 0) return "N/A";

    try {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${checkList.checkList}`;
      link.download = `checklist_${index + 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading checklist:", error);
      return "Download Error";
    }
  };

  const showPausedReasonModal = (service) => {
    setSelectedJob({
      serviceId: service.id,
      serviceCategory: service.category,
      serviceName: service.service_name,
    });
    setIsPausedReasonModalVisible(true);
  };

  const closePausedReasonModal = () => {
    setIsPausedReasonModalVisible(false);
  };

  const handleUpdateJobStatus = async (serviceId, JobStatus) => {
    setUpdatingStatus(serviceId);
    try {
      let dataToSend = {
        jobId: jobId,
        quoteServiceId: serviceId,
        status: JobStatus
      };
      const response = await dispatch(updateJobStatus(dataToSend)).unwrap();

      if (response) {
        notification.success({
          message: <h5>Updated successfully!</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5
        });
        // Refetch only service details instead of full job details
        if (onRefetchServiceDetails) {
          await onRefetchServiceDetails();
        }
      }
      return response;
    } catch (error) {
      notification.error({
        message: <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const processedData = React.useMemo(() => {
    if (!serviceData || serviceData.length === 0) return [];
  
    // First, sort the serviceData by category
    const sortedServiceData = [...serviceData].sort((a, b) => {
      return a.serviceCategory.localeCompare(b.serviceCategory);
    });

    const categoryCompletionStatus = {};
    sortedServiceData.forEach(item => {
      if (!categoryCompletionStatus[item.serviceCategoryId]) {
        categoryCompletionStatus[item.serviceCategoryId] = {
          total: 0,
          completed: 0
        };
      }
      categoryCompletionStatus[item.serviceCategoryId].total++;
      if (item.jobStatus === "Completed") {
        categoryCompletionStatus[item.serviceCategoryId].completed++;
      }
    });  
  
    const categoryGroups = {};
    sortedServiceData.forEach((item, index) => {
      if (!categoryGroups[item.serviceCategoryId]) {
        categoryGroups[item.serviceCategoryId] = [];
      }
      categoryGroups[item.serviceCategoryId].push(index);
    });
  
    return sortedServiceData.map((item, index) => {
      const group = categoryGroups[item.serviceCategoryId];
      const isFirstInGroup = group && group[0] === index;
      const rowSpan = isFirstInGroup ? group.length : 0;
      const isCategoryCompleted = categoryCompletionStatus[item.serviceCategoryId]?.completed === 
                               categoryCompletionStatus[item.serviceCategoryId]?.total;

      return {
        id: item.quoteServiceId || index,
        category: item.serviceCategory,
        service_name: item.serviceName,
        checklist: item.checkList,
        serviceCategoryId: item.serviceCategoryId,
        linked_spare_part: item.linkedSparePartDtos?.join(", ") || "-",
        job_status: item.jobStatus,
        paused_reason: item.isFeedback,
        main_technician: item.mainTechnicianName,
        main_technician_id: item.mainTechnicianId,
        assistant_technicians: item.assistantTechNames || [],
        technician: item.universalTechnicianName,
        universalTechnicianId: item.universalTechnicianId,
        rowSpan: rowSpan,
        isCategoryCompleted,
        isNeedAssistance: item.isNeedAssistance
      };
    });
  }, [serviceData]);

  const serviceColumns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (value, row) => ({
        children: value,
        props: { rowSpan: row.rowSpan || 0 },
      }),
    },
    {
      title: (
        <>
          Universal Technician
          <br />
          Assignment
        </>
      ),
      dataIndex: "technician",
      key: "technician",
      render: (value, row) => {
        const techniciansForCategory = technicianLists[row.serviceCategoryId] || [];
        const isLoading = loadingTechnicians[row.serviceCategoryId];
        const selectedTechnician = techniciansForCategory.find(
          tech => tech.value === row.universalTechnicianId
        ) || {
          label: "Not Assigned",
          value: null,
        };

        const shouldEnable = 
          (!row.isNeedAssistance && !row.job_status) ||
          (row.isNeedAssistance && row.job_status === 'Paused');
        const shouldDisable = !shouldEnable || isDisabled;
        return {
          children: isLoading ? (
            <span>Loading technicians...</span>
          ) : (
            <div id={`universal-technician-assignment-${row.id}`}>
              <TableRadioSelect
                id={jobId}
                options={techniciansForCategory}
                defaultValue={selectedTechnician}
                value={row.universalTechnicianId}
                disabled={row.isCategoryCompleted || shouldDisable}
                onChange={(selected) => {
                  if (isDisabled) return;
                  handleAssignTechnician(
                    row.serviceCategoryId,
                    selected
                  );
                }}
              />
            </div>
          ),
          props: {
            rowSpan: row.rowSpan || 0,
            style: row.rowSpan > 1 ? { borderRight: "1px solid #E4EAF2" } : {},
          },
        };
      }
    },
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
    },
    {
      title: "Checklist",
      dataIndex: "checklist",
      key: "checklist",
      render: (checklist, record) => {
        if (!checklist || checklist.length === 0) return "N/A";
        
        // Filter valid checklists
        const validChecklists = checklist.filter(
          item => item && item.checkList && item.checkList.trim() !== ""
        );
        
        if (validChecklists.length === 0) return "N/A";
        
        return (
          <div>
            {validChecklists.map((item, index) => (
              <React.Fragment key={index}>
                <a
                  onClick={() => downloadChecklist(item, index)}
                  style={{ cursor: "pointer", marginRight: 4 }}
                  className="check"
                  id={`service-checklist-${record.id}-${index + 1}`}
                >
                  {`checklist ${index + 1}`}
                </a>
                {index < validChecklists.length - 1 && ", "}
              </React.Fragment>
            ))}
          </div>
        );
      },
    },
    {
      title: (
        <>
          Linked
          <br /> Spare Part
        </>
      ),
      dataIndex: "linked_spare_part",
      key: "linked_spare_part",
    },
    ...(universalJobStatus !== "Completed" ? [{
      title: "Job Status",
      dataIndex: "job_status",
      render: (_, row) => {
        const [currentStatus, setCurrentStatus] = useState(row.job_status);

        useEffect(() => {
          setCurrentStatus(row.job_status);
        }, [row.job_status]);

        const handleStatusChange = async (newStatus) => {
          // Don't proceed if the status hasn't changed
          if (newStatus === currentStatus || isDisabled) {
            return;
          }

          const oldStatus = currentStatus;
          try {

            if (newStatus === "Paused") {
              // Store the promise from onClickPauseReasonModelOpen
              const result = await onClickPauseReasonModelOpen(row.id);

              // If the popup was cancelled (result is false or undefined), revert the status
              if (!result) {
                setCurrentStatus(oldStatus);
                return;
              }

              // Only proceed with status update if pause reason was successfully submitted
              const response = await handleUpdateJobStatus(row.id, newStatus);
              if (response) {
                setCurrentStatus(newStatus);
              }
            } else {
              const response = await handleUpdateJobStatus(row.id, newStatus);
              if (response) {
                setCurrentStatus(newStatus);
              }
            }
          } catch (error) {
            // Revert to old status if there was an error
            setCurrentStatus(oldStatus);
            throw error;
          }
        };

        // Filter out the current status from options to prevent selecting it again
        const filteredOptions = statusOptions.filter(opt =>
          opt.value === "" || opt.value !== currentStatus
        );

        const isCompleted = currentStatus === "Completed";
        return (
          <div id={`job-service-status-${row.id}`}>
            <StatusDropDown
              options={filteredOptions}
              defaultStatus={currentStatus}
              disabled={updatingStatus === row.id || isCompleted || isDisabled}
              currentStatus={currentStatus}
              onChange={handleStatusChange}
            />
          </div>
        );
      },
    }] : []),
    {
      title: (
        <>
          Paused
          <br /> Reason
        </>
      ),
      dataIndex: "paused_reason",
      key: "paused_reason",
      className: "reason",
      render: (text, record) =>
        record.job_status === "Paused" && text ? (
          <a
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              color: "#1D366F",
              textDecoration: "underline",
              fontWeight: 500,
            }}
            id={`job-paused-reason-view-${record.id}`}
            onClick={(e) => {
              e.preventDefault();
              showPausedReasonModal(record);
            }}
          >
            View
            <img
              src={Icons.arrow_left}
              alt="arrow-right"
              style={{
                marginLeft: "6px",
                width: "12px",
                height: "10px",
                transform: "rotate(180deg)",
              }}
              className="view-img"
            />
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: (
        <>
          Main
          <br /> Technician
        </>
      ),
      dataIndex: "main_technician",
      key: "main_technician",
    },
    {
      title: "Assistant Technicians",
      dataIndex: "assistant_technicians",
      key: "assistant_technicians",
      render: (technicianObjects, row) => {
        if (!Array.isArray(technicianObjects) || technicianObjects.length === 0) {
          return "-";
        }

        const technicianNames = technicianObjects.map(tech => tech.name);
        const visibleTechnicianNames = technicianNames.slice(0, 1);
        const remainingTechnicianNames = technicianNames.slice(1);

        return (
          <div className="business-type-badge-container">
            {visibleTechnicianNames.map((name, index) => (
              <span key={index} className="business-type-badge">
                {name}
              </span>
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
    },
    ...(universalJobStatus === "Completed"
      ? [{
        title: (
          <div style={{ textAlign: "center" }}>
            Job Status
          </div>
        ),
        dataIndex: "job_status",
        fixed: "right",
        render: (_, row) => {
          const [currentStatus, setCurrentStatus] = useState(row.job_status);

          useEffect(() => {
            setCurrentStatus(row.job_status);
          }, [row.job_status]);

          const handleStatusChange = async (newStatus) => {
            // Don't proceed if the status hasn't changed
            if (newStatus === currentStatus || isDisabled) {
              return;
            }

            const oldStatus = currentStatus;
            try {

              if (newStatus === "Paused") {
                // Store the promise from onClickPauseReasonModelOpen
                const result = await onClickPauseReasonModelOpen(row.id);

                // If the popup was cancelled (result is false or undefined), revert the status
                if (!result) {
                  setCurrentStatus(oldStatus);
                  return;
                }

                // Only proceed with status update if pause reason was successfully submitted
                const response = await handleUpdateJobStatus(row.id, newStatus);
                if (response) {
                  setCurrentStatus(newStatus);
                }
              } else {
                const response = await handleUpdateJobStatus(row.id, newStatus);
                if (response) {
                  setCurrentStatus(newStatus);
                }
              }
            } catch (error) {
              // Revert to old status if there was an error
              setCurrentStatus(oldStatus);
              throw error;
            }
          };

          // Filter out the current status from options to prevent selecting it again
          const filteredOptions = statusOptions.filter(opt =>
            opt.value === "" || opt.value !== currentStatus
          );

          const isCompleted = currentStatus === "Completed";

          return (
            isCompleted ? (
              <span className="job-completd-status">
                Completed
              </span>
            ) : (
              <div className="actions" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <StatusDropDown
                  options={filteredOptions}
                  defaultStatus={currentStatus}
                  disabled={updatingStatus === row.id || isCompleted || isDisabled}
                  currentStatus={currentStatus}
                  onChange={handleStatusChange}
                />
              </div>
            )
          );
        },
      }]
      : [{
        title: (
          <div style={{ textAlign: "center" }}>
            Assign
            <br />
            Technicians
          </div>
        ),
        render: (_, row) => {
          const shouldEnable = 
            (!row.isNeedAssistance && !row.job_status) ||
            (row.isNeedAssistance && row.job_status === 'Paused');
          const shouldDisable = !shouldEnable || isDisabled;
          return (
          <div className="actions" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Tooltip title="Assign Technicians" color="#000" placement="bottom">
                <img
                  src={Icons.pencil_simple_line}
                  alt="Assign Technician"
                  id={`assign-technicians-button-${row.serviceCategoryId}`}
                  onClick={(e) => {
                    if (shouldDisable) return;
                    e.stopPropagation();
                    onClickAssignTechnicianModel(
                      row.serviceCategoryId,
                      row.assistant_technicians,
                      row.main_technician
                    );
                    handleQuoteServiceId(row.id);
                    handleJobDetailsData({
                      mainTechnician: row.main_technician,
                      mainTechnicianId: row.main_technician_id,
                      assistantTechnicians: row.assistant_technicians
                    });
                  }}
                  style={{ 
                    cursor: shouldDisable ? "not-allowed" : "pointer",
                    opacity: shouldDisable ? 0.5 : 1
                  }}
                />
              </Tooltip>
          </div>
          );
        },
        fixed: "right",
      }]
    ),
  ];

  return (
    <>
      {processedData.length > 0 ? (
        <Table
          scroll={{ x: "max-content" }}
          columns={serviceColumns}
          dataSource={processedData}
          rowKey="id"
          className="job-service-table"
          pagination={false}
        />
      ) : (
        <h4 className="embty-data">
          {serviceData.length === 0 ? "No services found for this job" : "Loading..."}
        </h4>
      )}
      <PausedReasonModal
        visible={isPausedReasonModalVisible}
        onClose={closePausedReasonModal}
        service={selectedJob}
      />
    </>
  );
};

export default ServiceDataTable;