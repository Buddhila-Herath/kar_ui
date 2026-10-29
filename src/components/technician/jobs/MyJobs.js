import React, { useState, useEffect, useRef } from "react";
import JobCard from "./JobCard";
import EmptyComponent from "./../EmptyComponents"
import { formatCount } from "../../../utils/helperUtils.js";

const MyJobs = ({
  taskToCompleteJobs = [],
  taskCompletedJobs = [],
  status,
  tabIndex,
  jobCountDto = { tasktocompleted: 0, taskcompleted: 0 },
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedSubTab = localStorage.getItem("techActiveTab");
    return savedSubTab !== null ? parseInt(savedSubTab) : 0;
  });

  const tabHeaderRef = useRef(null); 
  useEffect(() => {
    localStorage.setItem("techActiveTab", activeTab);
  }, [activeTab]);

  return (
    <>
      <div className="my-jobs-tab-header " ref={tabHeaderRef} id="technician-my-jobs-tab-header">
        <div
          id="technician-tasks-to-complete-tab"
          className={`tab-item my-tab-item ${activeTab === 0 ? "active" : ""}`}
          onClick={() => {
            setActiveTab(0);
            if (window.innerWidth < 768 && tabHeaderRef.current) {
              tabHeaderRef.current.scrollTo({
                left: 0,
                behavior: "smooth",
              });
            }
          }}
        >
          <h2 id="technician-tasks-to-complete-title">Tasks to Complete</h2>
          <h4 className="tab-count" id="technician-tasks-to-complete-count">
            {formatCount(jobCountDto.tasktocompleted)}
          </h4>
        </div>
        <div className="tab-separator" id="technician-my-jobs-tab-separator" />
        <div
          id="technician-completed-tasks-tab"
          className={`tab-item my-tab-item ${activeTab === 1 ? "active" : ""}`}
          onClick={() => {
            setActiveTab(1);
            if (window.innerWidth < 768 && tabHeaderRef.current) {
              tabHeaderRef.current.scrollTo({
                left: tabHeaderRef.current.scrollWidth,
                behavior: "smooth",
              });
            }
          }}
        >
          <h2 id="technician-completed-tasks-title">Completed Tasks</h2>
          <h4 className="tab-count" id="technician-completed-tasks-count">
            {formatCount(jobCountDto.taskcompleted)}
          </h4>
        </div>
      </div>

      <div id="technician-my-jobs-content">
        {activeTab === 0 ? (
          taskToCompleteJobs.length > 0 ? (
            <JobCard
              jobs={taskToCompleteJobs}
              status={status}
              tabIndex={tabIndex}
            />
          ) : (
            <EmptyComponent jobs="Pending Tasks" />
          )
        ) : activeTab === 1 ? (
          taskCompletedJobs.length > 0 ? (
            <JobCard
              jobs={taskCompletedJobs}
              status="Completed Tasks"
              tabIndex={tabIndex}
            />
          ) : (
            <EmptyComponent jobs="Completed Jobs" />
          )
        ) : null}
      </div>
    </>
  );
};

export default MyJobs;
