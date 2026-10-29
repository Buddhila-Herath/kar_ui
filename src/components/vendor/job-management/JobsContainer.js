import React from 'react';
import JobCard from './JobCard';

const JobsContainer = ({jobs, status, tabIndex}) => {

  return (
      <div className="tab-content">
        {jobs.map((job, index) => (
          <JobCard
            key={index}
            job={job}
            status={status}
            tabIndex={tabIndex} 
          />
        ))}
      </div>
  );
}

export default JobsContainer;