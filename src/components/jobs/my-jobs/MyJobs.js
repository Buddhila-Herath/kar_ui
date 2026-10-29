import React, { useState, useEffect } from 'react';
import PendingJobs from './PendingJobs';
import CompletedJobs from './CompletedJobs';
import { useNavigate } from "react-router-dom";

const MyJobs = (props) => {
  const { allMyJobs, formattedMessage, updateJobStatus } = props;
  const [activeTab, setActiveTab] = useState(0);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [todoAndInProgressJobs, setTodoAndInProgressJobs] = useState([]);
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    setCompletedJobs(Array.isArray(allMyJobs) ? allMyJobs.filter(job => job.technicianJobStatus === 'COMPLETED') : [] );
    setTodoAndInProgressJobs(Array.isArray(allMyJobs) ? allMyJobs.filter(job =>
        job.technicianJobStatus === 'TODO' ||
        job.technicianJobStatus === 'INPROGRESS' ||
        job.technicianJobStatus === 'SUGGESTEDFEEDBACK'
    ) : []);
  }, [allMyJobs]);

  const updateStatusData = (formValue) => {
    updateJobStatus(formValue, navigate).then(() => {
      //allMyJobs();
    });
  };

  return (
    <>
      <div className="my-jobs-tab-header">
        <div className={`tab-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => handleTabClick(0)}>
          <h2>{formattedMessage("dashboard.task-to-complete")}</h2>
          <h4 className="tab-count">{todoAndInProgressJobs.length.toString().padStart(2, '0')}</h4>
        </div>
        <div className="tab-separator" />
        <div className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleTabClick(1)}>
          <h2>{formattedMessage("dashboard.completed-tasks")}</h2>
          <h4 className="tab-count">{completedJobs.length.toString().padStart(2, '0')}</h4>
        </div>
      </div>
      {activeTab === 0 && (
        <PendingJobs jobs={todoAndInProgressJobs} updateStatusData={updateStatusData} />
      )}
      {activeTab === 1 && (
        <CompletedJobs jobs={completedJobs} />
      )}
    </>
  );
};

export default MyJobs;