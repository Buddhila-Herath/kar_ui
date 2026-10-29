import React, { useState, forwardRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Icons from "../../../utils/icons"
import { useDispatch } from 'react-redux';
import moment from "moment";
import FeedbackPopup from './FeedbackHistoryPopup';

const PendingJobDetail = forwardRef(({ onBackButtonClick, updateStatusData, jobDetails, checklists, technicianJobId, technicianJobStatus  }, ref) => {
  const navigate = useNavigate();
  const [isJobDetailCollapsed, setIsJobDetailCollapsed] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [jobStatus, setJobStatus] = useState('Todo');
  const dispatch = useDispatch();

  const handleCollapseJobDetail = () => {
    setIsJobDetailCollapsed((prevCollapsed) => !prevCollapsed);
  };

  const handleToggleService = (index) => {
    setActiveServiceIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const openFeedbackPopupHandler = () => {
    dispatch(FeedbackPopup());
  };

  const [jobValue, setjobValue] = useState({
      technicianJobId: '',
      estimatedHours: '',
      taskStatus: '',
      suggestFeedBack: ''
  });

  const [errors, setErrors] = useState({
      technicianJobId: '',
      estimatedHours: '',
      taskStatus: '',
      suggestFeedBack: ''
  });

  const prepareFormData = (data) => {
    return {
        technicianJobId: technicianJobId,
        estimatedHours: jobStatus === 'Completed' ? data.estimatedHours : null,
        taskStatus: jobStatus,
        suggestFeedBack: jobStatus === 'SuggestFeedBack' ? data.suggestFeedBack : null
    };
  };    

  const handleChange = (e) => {
      e.persist();
      setjobValue(inputs => ({...inputs, [e.target.name]: e.target.value}));
      setErrors('');
  };

  const handleValidation = () => {
    const errors = {};
    let isValid = true;
  
    if (jobStatus === 'SuggestFeedBack' && !jobValue.suggestFeedBack) {
      isValid = false;
      errors.suggestFeedBack = "Please provide feedback. ";
    }
  
    if (jobStatus === 'Completed' && !jobValue.estimatedHours) {
      isValid = false;
      errors.estimatedHours = "Please provide the actual estimate.";
    }
  
    setErrors(errors);
    return isValid;
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    const Valid = handleValidation();
    if (Valid) {
      updateStatusData(prepareFormData(jobValue), navigate);
      onBackButtonClick();
    }
  };
  
  return (
    <div className="job-detail-content" ref={ref}>
      <div className="job-detail-top-header">
        <button className="back-button" onClick={onBackButtonClick}>
          <img src={Icons.back_icon} alt="Back Icon" className="back-icon" />
          <h5>Back</h5>
        </button>
        <div className={`job-status ${
            technicianJobStatus === 'TODO' 
                ? 'todo' 
                : technicianJobStatus === 'INPROGRESS' 
                ? 'in-progress' 
                : technicianJobStatus === 'SUGGESTEDFEEDBACK' 
                ? 'suggest-feedback' 
                : ''
            }`}>
          <h6>
              {technicianJobStatus === 'TODO' 
                  ? 'TO DO' 
                  : technicianJobStatus === 'INPROGRESS' 
                  ? 'In Progress' 
                  : technicianJobStatus === 'SUGGESTEDFEEDBACK' 
                  ? 'Suggest Feedback' 
                  : 'Unknown Status'}
          </h6>
        </div>
      </div>
      <div className="job-detail-box">
        <div className="my-job-detail-header">
          <div className="job-detail-header">
            <h4>Job Details</h4>
            <img src={Icons.briefcase} alt="Job Details Icon" />
          </div>
          <div className="collapse-icon" onClick={handleCollapseJobDetail}>
            <img src={Icons.caret_up} alt="Collapse Icon" className={isJobDetailCollapsed ? 'collapsed' : ''} />
          </div>
        </div>
        {!isJobDetailCollapsed && (
          <>
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
              <h4 className="entity-value">{jobDetails.estimatedHours} Hours</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Priority</h5>
              <h4 className="entity-value">{jobDetails.priority}</h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Created Date</h5>
              <h4 className="entity-value">
                { moment(jobDetails.jobCreated).format("DD-MM-YYYY") }
              </h4>
            </div>
            <div className="entity">
              <h5 className="entity-label">Notes</h5>
              <h4 className="entity-value">{jobDetails.notes}</h4>
            </div>
          </>
        )}
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
                        checklists
                      .find((checklist) => checklist.serviceId === service.serviceId)
                      ?.checklist.map((item) => (
                        <div className="service-checklist" key={item.checklistId}>
                          <input type="checkbox" className="service-checkbox" />
                          <span className="service-label">{item.checklistName}</span>
                        </div>
                      ))
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
      <div className="job-detail-box">
        <div className="job-detail-header">
          <h4>Update Job Status</h4>
          <img src={Icons.pencil_simple_line} alt="Update Job Status Icon" />
        </div>
        <div className="job-status-update">
          <div className='job-status-header'>
            <h4>Current Job Status</h4>
            <img src={Icons.clock_counter_clockwise} onClick={() => openFeedbackPopupHandler()} alt="Current Job Status Icon" />
            <FeedbackPopup />
          </div>
          <div className="job-status-options">
            <div className="job-status-option">
              <input
                type="radio"
                name="job-status"
                id="todo"
                value="todo"
                checked={jobStatus === 'Todo'}
                onChange={() => setJobStatus('Todo')}
              />
              <label htmlFor="todo">To Do</label>
            </div>
            <div className="job-status-option">
              <input
                type="radio"
                name="job-status"
                id="in-progress"
                value="in-progress"
                checked={jobStatus === 'inprogress'}
                onChange={() => setJobStatus('inprogress')}
              />
              <label htmlFor="in-progress">In Progress</label>
            </div>
            <div className="job-status-option">
              <input
                type="radio"
                name="job-status"
                id="suggest-feedback"
                value="suggest-feedback"
                checked={jobStatus === 'SuggestFeedBack'}
                onChange={() => setJobStatus('SuggestFeedBack')}
              />
              <label htmlFor="suggest-feedback">Suggest Feedback</label>
            </div>
            {jobStatus === 'SuggestFeedBack' && (
              <div className="job-status-feedback">
                <textarea 
                  name="suggestFeedBack"
                  placeholder="Enter your feedback"
                  onChange={(e) => handleChange(e)}
                />
                <span className="text-danger d-block fw-400 fs-12 mt-2 text-start">
                    {errors["suggestFeedBack"] ? errors["suggestFeedBack"] : null}
                </span>
              </div>
            )}
            <div className="job-status-option">
              <input
                type="radio"
                name="job-status"
                id="complete"
                value="complete"
                checked={jobStatus === 'Completed'}
                onChange={() => setJobStatus('Completed')}
              />
              <label htmlFor="complete">Complete</label>
            </div>
            {jobStatus === 'Completed' && (
              <div className="job-status-feedback">
                <div className="job-status-feedback-box">
                  <h4 className="job-status-feedback-label">Actual Effort</h4>
                  <input 
                    type="number" 
                    name="estimatedHours"
                    min="0" 
                    onChange={(e) => handleChange(e)}
                  />
                  <span className="text-danger d-block fw-400 fs-12 mt-2 text-start">
                      {errors["estimatedHours"] ? errors["estimatedHours"] : null}
                  </span>
                </div>
                <div className="job-status-feedback-box">
                  <h4 className="job-status-feedback-label">Feedback</h4>
                  <textarea 
                    name="feedback"
                    placeholder="Enter your feedback" 
                    onChange={(e) => handleChange(e)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="button" onClick={(e) => onSubmit(e)}>
          <h4>Submit</h4>
        </button>
      </div>
    </div>
  );
});

export default PendingJobDetail;