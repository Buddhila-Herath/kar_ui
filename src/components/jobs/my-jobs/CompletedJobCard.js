import React from "react";

const CompletedJobCard = ({ job, isSelected, onClickView }) => {
    return (
        <div className={`box ${isSelected ? 'job-box-selected' : ''}`}>
            <div className="box-top">
                <div className="box-header">
                    <div className="box-header-left">
                        <h3 className="box-title">{job.quoteName}</h3>
                        <div className="box-job-number">{job.jobCardNumber}</div>
                    </div>
                    <div className="box-date">
                        <h6 className="label">Deadline: 
                            {new Date(job.deadLine).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </h6>
                    </div>
                </div>
                <div className="box-body">
                    <div className="entity my-entity">
                        <span className="entity-label">Vehicle Reg Number:</span>
                        <span className="entity-value">{job.vehicleRegNum}</span>
                    </div>
                    <div className="entity my-entity">
                        <span className="entity-label">Estimated Hours:</span>
                        <span className="entity-value">{job.estimatedHours} hours</span>
                    </div>
                </div>
            </div>
            <div className="box-bottom">
                <div className="separator" />
                <div className="box-footer">
                    <button className="button" >
                        <h5>View Job Details</h5>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CompletedJobCard;