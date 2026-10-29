import React from "react";
import Icons from "../../utils/icons";

const EmptyComponent = ({ jobs }) => {

    const titleCaseJobs = jobs
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className='no-data-container job-empty tech-empty' id="technician-empty-component">
            <div className="no-data-icon" id="technician-empty-component-icon"><img src={Icons.briefcase} alt="Warning" id="technician-empty-component-icon-img" /></div>
            <h2 id="technician-empty-component-title">No {titleCaseJobs}</h2>
            {jobs === "Pending Tasks" ? (
                <p id="technician-empty-component-message">Only tasks that are yet to be completed will appear here.</p>
            ) : (
                <p id="technician-empty-component-message">Only {jobs.toLowerCase()} will appear here</p>
            )}  
        </div>
    );
};

export default EmptyComponent;