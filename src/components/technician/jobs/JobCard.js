import React from "react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ jobs, status, tabIndex }) => {
  const navigate = useNavigate();

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false; 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0); 
    return deadlineDate < today; 
  };

  return (
    <div className="tab-content tech-job-card" id="technician-job-card-container">
      {jobs.map((job, index) => {
    const deadlinePassed = isDeadlinePassed(job.deadline);
    return (
        <div className="box" key={index} id={`technician-job-card-${job.id || index}`}>
          <div className="box-top" id={`technician-job-card-top-${job.id || index}`}>
            <div className="box-header" id={`technician-job-card-header-${job.id || index}`}>
              <div className="box-header-left" id={`technician-job-card-header-left-${job.id || index}`}>
                <h3 className="box-title" id={`technician-job-card-title-${job.id || index}`}>{job.jobCardId}</h3>
                <div className="box-job-number" id={`technician-job-card-number-${job.id || index}`}></div>
              </div>
            <div className="sub-head" id={`technician-job-card-subhead-${job.id || index}`}>
              {!job.isView && (
                 <div className=" prio-badge-box " id={`technician-job-card-priority-badge-${job.id || index}`}>
                 <h6 className="label" id={`technician-job-card-priority-label-${job.id || index}`}>
                    <span id={`technician-job-card-priority-value-${job.id || index}`}> {job.priority ?? "N/A"}</span>
                  </h6>
               </div>
              )}
              <div className={`box-date ${(job.jobStatus !== "Completed" && deadlinePassed) ? "deadline-passed" : ""}`} id={`technician-job-card-deadline-${job.id || index}`}>
                <h6 className="label" id={`technician-job-card-deadline-label-${job.id || index}`}>
                  Deadline:
                  <span id={`technician-job-card-deadline-value-${job.id || index}`}> {job.deadline ?? "N/A"}</span>
                </h6>
              </div>
            </div>
          </div>
            <div className="box-body" id={`technician-job-card-body-${job.id || index}`}>
              <div className="entity my-entity" id={`technician-job-card-vehicle-reg-${job.id || index}`}>
                <span className="entity-label jobentity" id={`technician-job-card-vehicle-reg-label-${job.id || index}`}>
                  Vehicle Reg Number
                </span>
                <span className="entity-value jobentity" id={`technician-job-card-vehicle-reg-value-${job.id || index}`}>
                  {job.vehicleRegNumber ?? "N/A"}
                </span>
              </div>
              <div className="entity my-entity" id={`technician-job-card-estimated-hours-${job.id || index}`}>
                <span className="entity-label jobentity" id={`technician-job-card-estimated-hours-label-${job.id || index}`}>Estimated Hours</span>
                <span className="entity-value jobentity" id={`technician-job-card-estimated-hours-value-${job.id || index}`}>
                  {job.estimatedHours ?? "N/A"}
                </span>
              </div>
              <div className="entity my-entity" id={`technician-job-card-status-${job.id || index}`}>
                  <span className="entity-label jobentity" id={`technician-job-card-status-label-${job.id || index}`}>
                    {job.isView ? "Priority" : "Status"}
                  </span>

                  {job.isView ? (
                    <span className={`entity-badge ${job.priority}`} id={`technician-job-card-priority-badge-value-${job.id || index}`}>
                      <h6 id={`technician-job-card-priority-text-${job.id || index}`}>{job.priority ?? "N/A"}</h6>
                    </span>
                  ) : (
                    <span className="entity-badge" id={`technician-job-card-status-badge-${job.id || index}`}>
                      <h6 id={`technician-job-card-status-text-${job.id || index}`}>Pending quote approval</h6>
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="box-bottom" id={`technician-job-card-bottom-${job.id || index}`}>
            <div className="separator" id={`technician-job-card-separator-${job.id || index}`} />
            <div className="box-footer view-job-btn" id={`technician-job-card-footer-${job.id || index}`}>
              <button
                  id={`technician-job-card-view-button-${job.id || index}`}
                  className={`button ${!job.isView ? "disabled-button" : ""}`}
                  type="button"
                  onClick={() => navigate(`/app/details/${job.id}`, { state: { status, tabIndex } })} 
                  disabled={!job.isView}
                >
                <h5 id={`technician-job-card-view-button-text-${job.id || index}`}>View Job</h5>
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default JobCard;
