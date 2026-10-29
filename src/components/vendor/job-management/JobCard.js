import React from "react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job, status, tabIndex  }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/app/job-management/detail/${job.id}`, {
      state: { 
        status,
        tabIndex,
        
      }
    });
  };

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
    <div className="box">
      <div className="box-top">
        <div className="box-header">
          <div className="box-header-left">
            <h3 className="box-title">{job.jobCardId}</h3>
            <div className="box-job-number"></div>
          </div>

          <div className="sub-head">
            {!job.isView && (
              <div className=" prio-badge-box ">
                <h6 className="label">
                  <span> {job.priority ?? "N/A"}</span>
                </h6>
              </div>
            )}
            <div className={`box-date ${(job.jobStatus !== "Completed" && deadlinePassed) ? "deadline-passed" : ""}`}>
              <h6 className="label">
                Deadline:
                 <span> {job.deadline ?? "N/A"}</span>
              </h6>
            </div>
          </div>
        </div>
        <div className="box-body">
          <div className="entity my-entity">
            <span className="entity-label jobentity">Vehicle Reg Number</span>
            <span className="entity-value jobentity">{job.vehicleRegNumber ?? "N/A"}</span>
          </div>
          <div className="entity my-entity">
            <span className="entity-label jobentity">Estimated Hours </span>
            <span className="entity-value jobentity">{job.estimatedHours ?? "N/A"}</span>
          </div>
          <div className="entity my-entity">
            <span className="entity-label jobentity">Priority</span>
            {job.isView ? (
              <span className={`entity-badge ${job.priority}`}>
                <h6>{job.priority ?? "N/A"}</h6>
              </span>
            ) : (
              <span className="entity-badge">
              <h6>Pending quote approval </h6>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="box-bottom">
        <div className="separator" />
        <div className="box-footer">
        <button
            className={`button ${!job.isView ? "disabled-button" : ""}`}
            type="button"
            onClick={handleViewClick}
            disabled={!job.isView}
            id={`job-card-${job.jobCardId}`}
          >
            <h5>View Job</h5>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
