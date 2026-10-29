import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Table, Tooltip, notification } from "antd";
import StatusDropDown from "../../shared/select/StatusDropDown";
import Icons from "../../utils/icons";
import PausedReasonModal from "./PausedReasonModal";
import {
  updateJobStatus,
} from "../../slices/vendor/jobSlice";
import {
  fetchJobDetails,
} from "../../slices/technician/jobSlice";

// Job status dropdown options
const statusOptions = [
  { label: "", value: "" },
  { label: "Started", value: "Started" },
  { label: "Paused", value: "Paused" },
  { label: "Completed", value: "Completed" },
];

const ServiceDataTable = ({
  jobId,
  serviceData,
  onClickPauseReasonModelOpen,
  className,
  activeTab,
  jobType,
  handleClaimChange
}) => {
  const dispatch = useDispatch();

  // Modal visibility for paused reason
  const [isPausedReasonModalVisible, setIsPausedReasonModalVisible] =
    useState(false);

  // Selected job info for the paused reason modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Track which row is updating status
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Download checklist file from base64 string
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

  // Show paused reason modal for a job
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

  // Update job status
  const handleUpdateJobStatus = async (serviceId, JobStatus) => {
    setUpdatingStatus(serviceId);
    try {
      const response = await dispatch(
        updateJobStatus({
          jobId: jobId,
          quoteServiceId: serviceId,
          status: JobStatus,
        })
      ).unwrap();

      if (response) {
        notification.success({
          message: <h5>Updated successfully!</h5>,
          icon: <img src={Icons.check} alt="Success" />,
          duration: 5,
        });

        await dispatch(fetchJobDetails(jobId));
      }
      return response;
    } catch (error) {
      notification.error({
        message: (
          <h5>{error.errors ? error.errors[0] : "Something went wrong"}</h5>
        ),
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const processedData = React.useMemo(() => {
    if (!serviceData || serviceData.length === 0) return [];

    const filteredServiceData = serviceData.filter(item => {
      if (jobType === "Available Jobs") {
        if (activeTab === "open") {
          // Show unclaimed jobs or jobs claimed by others (not "You")
          return !item.mainTechnicianName;
        } else if (activeTab === "claimed") {
          // Show only jobs claimed by "You"
          return !!item.mainTechnicianName;
        }
      }
      return true;
    });

    // First, sort the serviceData by category
    const sortedServiceData = [...filteredServiceData].sort((a, b) => {
      return a.serviceCategory.localeCompare(b.serviceCategory);
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

      return {
        id: item.quoteServiceId || index,
        category: item.serviceCategory,
        service_name: item.serviceName,
        checklist: item.checkList,
        serviceCategoryId: item.serviceCategoryId,
        linked_spare_part: item.linkedSparePartDtos?.join(", ") || "-",
        job_status: item.jobStatus || "",
        paused_reason: item.isFeedback,
        main_technician: item.mainTechnicianName,
        main_technician_id: item.mainTechnicianId,
        assistant_technicians: item.assistantTechNames || [],
        technician: item.universalTechnicianName,
        universalTechnicianId: item.universalTechnicianId,
        claimed: item.mainTechnicianName ? true : false,
        claimedBy: item.mainTechnicianName || "-",
        isEditable: item.isEditable,
        rowSpan,
      };
    });
  }, [serviceData, activeTab, jobType]);

  const serviceColumns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (value, row) => ({
        children: value,
        props: {
          rowSpan: row.rowSpan || 0,
          style: row.rowSpan > 1 ? { borderRight: "1px solid #E4EAF2" } : {},
        },
      }),
    },
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
    },
    {
      title: "Linked Spare Part",
      dataIndex: "linked_spare_part",
      key: "linked_spare_part",
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
    ].concat(
      // Only include Paused Reason column for "Task to Complete" jobs
      jobType === "Task to Complete" ? [{
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
    }] : [],
    jobType === "Available Jobs" && activeTab === "open" ? [{
      title: "",
      dataIndex: "claimService",
      key: "claimService",
      render: (_, record) => {
        const isClaimed =
          record.claimed === "claimed" || record.claimed === true;
        return (
          <>
            {record.isEditable === true ? (
              <button
                className={`claim-service-button ${
                  isClaimed ? "claimed-service" : ""
                }`}
                onClick={() => {
                  if (!isClaimed) {
                    handleClaimChange(record);
                  }
                }}
                disabled={isClaimed}
              >
                {isClaimed ? "Claimed" : "Claim Service"}
              </button>
            ) : (
              <button className="claim-service-button claimed-service-disabled" disabled>
                Claim Service
              </button>
            )}
          </>
        );
      },
    }] : [],

    activeTab === "claimed" ? [{
      title: "Service Claimed By",
      dataIndex: "claimedBy",
      key: "claimedBy",
      render: (text, record) => {
        const isYou = record.claimedBy === "You";
        return (
          <span style={{ color: isYou ? "#287956" : "#4E5569" }}>{record.claimedBy || "-"}</span>
        );
      },
    }] : [],

    (jobType === "Task to Complete" || jobType === "Completed Tasks") ? [{
      title: "Status",
      dataIndex: "job_status",
      key: "job_status",
      render: (status, row) => {
        // No status available and not claimed by "You"
        if (!status && row.main_technician !== "You") {
          return <span className="job-null" />;
        }
        // Claimed by someone else (not "You")
        if ((row.main_technician && row.main_technician !== "You")) {
          const statusPart = status.toLowerCase();
          const colorMap = {
            started: "#E0EBFF",
            paused: "#FAF4E0",
            completed: "#E2FFE6",
          };
          return (
            <span
              className="job-status-change"
              style={{
                backgroundColor: colorMap[statusPart],
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        }
          // Default dropdown behavior
          const [currentStatus, setCurrentStatus] = useState(row.job_status);

          useEffect(() => {
            setCurrentStatus(row.job_status);
          }, [row.job_status]);

          const handleStatusChange = async (newStatus) => {
            // Don't proceed if the status hasn't changed
            if (newStatus === currentStatus) {
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
              <StatusDropDown
                options={filteredOptions}
                defaultStatus={currentStatus}
                disabled={updatingStatus === row.id || isCompleted || row.claimedBy !== "You"}
                currentStatus={currentStatus}
                onChange={handleStatusChange}
              />
            )
          );
      },
      fixed: window.innerWidth <= 768 ? "right" : undefined,
    }] : []
  ).filter(Boolean);

  return (
    <>
      <Table
        dataSource={processedData}
        columns={serviceColumns}
        rowKey="id"
        pagination={false}
        className={className}
        id="technician-service-data-table"
        scroll={{ x: "max-content" }}
      />

      <PausedReasonModal
        visible={isPausedReasonModalVisible}
        onClose={closePausedReasonModal}
        service={selectedJob}
        id="technician-paused-reason-modal"
      />
    </>
  );
};

export default ServiceDataTable;
