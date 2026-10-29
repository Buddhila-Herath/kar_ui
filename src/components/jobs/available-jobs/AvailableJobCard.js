import React from 'react';

const AvailableJobCard = ({ job, isSelected, onClickOverview, onClickClaim }) => {
    return (
        <div className={`box ${isSelected ? 'job-box-selected' : ''}`}>
            <div className="box-top">
                <div className="box-header">
                    <div className="box-header-left">
                        <h3 className="box-title">{job.quoteName}</h3>
                        <div className="box-job-number">{job.jobCardNumber}</div>
                    </div>
                    <div className="box-date">
                        <h6 className="label">Deadline: {new Date(job.deadLine).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}</h6>
                    </div>
                </div>
                <div className="box-body">
                    <div className="entity">
                        <span className="entity-label">Vehicle Reg Number:</span>
                        <span className="entity-value">{job.vehicleRegNum}</span>
                    </div>
                    <div className="entity">
                        <span className="entity-label">Estimated Hours:</span>
                        <span className="entity-value">{job.estimatedHours} hours</span>
                    </div>
                    <p className="description">Prepare the car surface, apply primer, and paint with two coats of high-quality automative paint.</p>
                </div>
            </div>
            <div className="box-bottom">
                <div className="separator" />
                <div className="box-footer">
                    <h6 className="tag" onClick={() => onClickOverview(job.jobId)}>
                        Job Overview
                    </h6>
                    <button className="button" onClick={() => onClickClaim(job.jobId)}>
                        <h5>Claim Job</h5>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AvailableJobCard;