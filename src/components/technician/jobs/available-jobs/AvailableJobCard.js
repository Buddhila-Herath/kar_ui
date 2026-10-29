import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCount } from "../../../../utils/helperUtils.js";

const AvailableJobCard = ({ job, status, tabIndex }) => {
  const navigate = useNavigate();
  const isDeadlinePassed = () => {
    if (!job.deadline) return false; 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(job.deadline);
    deadlineDate.setHours(0, 0, 0, 0); 
    return deadlineDate < today; 
  };
  const deadlinePassed = isDeadlinePassed();

  return (
    <a
      id={`technician-available-job-card-${job.id}`}
      onClick={(e) => {
        if (!job.isView) {
          e.preventDefault();
          return;
        }
        navigate(`/app/details/${job.id}`, { state: { status, tabIndex } });
      }}
      className="box"
      style={{ pointerEvents: !job.isView ? "none" : "auto" }}
    >
      <div className="box-top" id={`technician-available-job-card-top-${job.id}`}>
        <div className="box-header" id={`technician-available-job-card-header-${job.id}`}>
          <div className="box-header-left" id={`technician-available-job-card-header-left-${job.id}`}>
            <h3 className="box-title" id={`technician-available-job-card-title-${job.id}`}>{job.quoteName}</h3>
            <div className="tech-box-job-number" id={`technician-available-job-card-number-${job.id}`}>{job.jobCardId}</div>
          </div>

          <div className="sub-head" id={`technician-available-job-card-subhead-${job.id}`}>
            {!job.isView && (
              <div className=" prio-badge-box " id={`technician-available-job-card-priority-badge-${job.id}`}>
                <h6 className="label" id={`technician-available-job-card-priority-label-${job.id}`}>
                  <span id={`technician-available-job-card-priority-value-${job.id}`}> {job.priority ?? "N/A"}</span>
                </h6>
              </div>
            )}
            <div className={`box-date ${deadlinePassed ? "deadline-passed" : ""}`} id={`technician-available-job-card-deadline-${job.id}`}>
              <h6 className="label" id={`technician-available-job-card-deadline-label-${job.id}`}>
                Deadline:
                <span id={`technician-available-job-card-deadline-value-${job.id}`}> {job.deadline ?? "N/A"}</span>
              </h6>
            </div>
          </div>
        </div>
        <div className="box-body" id={`technician-available-job-card-body-${job.id}`}>
          <div className="entity" id={`technician-available-job-card-vehicle-reg-${job.id}`}>
            <span className="entity-label" id={`technician-available-job-card-vehicle-reg-label-${job.id}`}>Vehicle Reg Number</span>
            <span className="entity-value" id={`technician-available-job-card-vehicle-reg-value-${job.id}`}>
              {job.vehicleRegNumber ?? "N/A"}
            </span>
          </div>
          <div className="entity" id={`technician-available-job-card-estimated-hours-${job.id}`}>
            <span className="entity-label" id={`technician-available-job-card-estimated-hours-label-${job.id}`}>Estimated Hours </span>
            <span className="entity-value" id={`technician-available-job-card-estimated-hours-value-${job.id}`}>{job.estimatedHours ?? "N/A"}</span>
          </div>
          <div className="entity my-entity" id={`technician-available-job-card-status-${job.id}`}>
            <span className="entity-label jobentity" id={`technician-available-job-card-status-label-${job.id}`}>
              {job.isView ? "Priority" : "Status"}
            </span>

            {job.isView ? (
              <span className={`entity-badge ${job.priority}`} id={`technician-available-job-card-priority-badge-value-${job.id}`}>
                <h6 id={`technician-available-job-card-priority-text-${job.id}`}>{job.priority ?? "N/A"}</h6>
              </span>
            ) : (
              <span className="entity-badge" id={`technician-available-job-card-status-badge-${job.id}`}>
                <h6 id={`technician-available-job-card-status-text-${job.id}`}>Pending quote approval</h6>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="box-bottom" id={`technician-available-job-card-bottom-${job.id}`}>
        <div className="separator" id={`technician-available-job-card-separator-${job.id}`} />
        <div className="box-footer " id={`technician-available-job-card-footer-${job.id}`}>
          <button className="button total-service" id={`technician-available-job-card-total-services-${job.id}`}>
            <h5 id={`technician-available-job-card-total-services-title-${job.id}`}>Total Services</h5>
            <span className="totals-count" id={`technician-available-job-card-total-services-count-${job.id}`}>{formatCount(job.totalServices)}</span>
          </button>
          <button className="button available-service" id={`technician-available-job-card-available-services-${job.id}`}>
            <h5 id={`technician-available-job-card-available-services-title-${job.id}`}>Available Services</h5>
            <span id={`technician-available-job-card-available-services-count-${job.id}`}>{formatCount(job.availableServices)}</span>
          </button>
        </div>
      </div>
    </a>
  );
};

export default AvailableJobCard;
