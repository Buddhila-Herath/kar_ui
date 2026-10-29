import React from "react";
import AvailableJobCard from "./AvailableJobCard";

const AvailableJobs = (props) => {
  const { jobs, status, tabIndex } = props;

  return (
    <div className="tab-content" id="technician-available-jobs-container">
      {jobs.map((job, index) => (
        <AvailableJobCard
          key={index}
          job={job}
          status={status}
          tabIndex={tabIndex} 
        />
      ))}
    </div>
  );
};

export default AvailableJobs;
