import React, { useState, forwardRef, useEffect } from 'react';
import Icons from "../../../utils/icons"
import moment from "moment";

const AvailableJobDetail = forwardRef(({ selectedJob, onClickClaim, onBackButtonClick, jobDetails, checklists }, ref) => {
    const [activeServiceIndex, setActiveServiceIndex] = useState(0);

    const handleToggleService = (index) => {
        setActiveServiceIndex((prevIndex) => (prevIndex === index ? null : index));
    };
      
    return (
        <div className="job-detail-content" ref={ref}>
            <div className="job-detail-top-header">
                <button className="back-button" onClick={onBackButtonClick}>
                    <img src={Icons.back_icon} alt="Back Icon" className="back-icon" />
                    <h5>Back</h5>
                </button>
                <div className="job-date">
                    <h6 className="label">Deadline: {moment(jobDetails.jobCreated).format("DD/MM/YYYY")}</h6>
                </div>
            </div>
            <div className="job-detail-box">
                <div className="job-detail-header">
                    <h4>Job Details</h4>
                    <img src={Icons.briefcase} alt="Job Details Icon" />
                </div>
                <div className="entity">
                    <h5 className="entity-label">Job Card No</h5>
                    <h4 className="entity-value">{jobDetails.jobCardNumber}</h4>
                </div>
                <div className="entity">
                    <h5 className="entity-label">Job Description</h5>
                    <h4 className="entity-value">{jobDetails.description}</h4>
                </div>
                <div className="entity">
                    <h5 className="entity-label">Estimated Duration</h5>
                    <h4 className="entity-value">{jobDetails.estimatedHours} hours</h4>
                </div>
                <div className="entity">
                    <h5 className="entity-label">Priority</h5>
                    <h4 className="entity-value">{jobDetails.priority}</h4>
                </div>
                <div className="entity">
                    <h5 className="entity-label">Created Date</h5>
                    <h4 className="entity-value">{new Date(jobDetails.jobCreated).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}</h4>
                </div>
                <div className="entity">
                    <h5 className="entity-label">Notes</h5>
                    <h4 className="entity-value">{jobDetails.notes}</h4>
                </div>
            </div>
            <div className="job-detail-box">
                <div className="job-detail-header">
                    <h4>Services</h4>
                    <img src={Icons.car_cog} alt="Services Icon" />
                </div>
                {jobDetails.jobServices && jobDetails.jobServices.length > 0 ? (
                    jobDetails.jobServices.map((service, index) => (
                        <div key={index} className={`service ${activeServiceIndex === index ? 'active' : ''}`}>
                            <div className="service-header">
                                <h4 className="service-title">{service.serviceName}</h4>
                                <button className="service-toggle" onClick={() => handleToggleService(index)}>
                                    <img src={Icons.caret_circle_down} alt="down" style={{ display: activeServiceIndex === index ? 'none' : 'inline' }} />
                                    <img src={Icons.caret_circle_up} alt="up" style={{ display: activeServiceIndex === index ? 'inline' : 'none' }} />
                                </button>
                            </div>
                            {activeServiceIndex === index && (
                                <ul className="service-list">
                                    { checklists
                                    .find((checklist) => checklist.serviceId === service.serviceId)
                                    ?.checklist.map((item) => (
                                        <li key={item.checklistId}>{item.checklistName}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No services available for this job.</p>
                )}
            </div>
            <div className="job-detail-box">
                <div className="job-detail-header">
                    <h4>Products Required</h4>
                    <img src={Icons.wrench} alt="Products Icon" />
                </div> 
                {jobDetails && jobDetails.jobProductList && jobDetails.jobProductList.length > 0 ? (
                <ul className="products-list">
                    {jobDetails.jobProductList.map((product, index) => (
                    <li key={index}><h4>{product.productName}</h4></li>
                    ))}
                </ul>
                ) : (
                <p>No products available for this job.</p>
                )}
            </div>
            <div className="box-footer">
                <button className="button" onClick={() => onClickClaim(selectedJob)}>
                    <h4>Claim Job</h4>
                </button>
            </div>
        </div>
    );
});

export default AvailableJobDetail;