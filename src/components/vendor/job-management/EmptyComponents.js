import React from "react";
import Icons from "../../../utils/icons";

const EmptyComponent = ({ jobs }) => {

    const titleCaseJobs = jobs
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className='no-data-container job-empty'>
            <div className="no-data-icon"><img src={Icons.briefcase} alt="Warning" /></div>
            {jobs.toLowerCase() === "inqueue jobs" || jobs.toLowerCase() === "inqueue" ? (
                <>
                    <h2>No Jobs In Queue</h2>
                    <p>Only jobs In Queue will be displayed here.<br />
                    Keep track of your interrupted tasks and continue when ready.</p>
                </>
            ) : (
                <>
                    <h2>No {titleCaseJobs}</h2>
                    <p>Only {jobs.toLowerCase()} will be displayed here.<br />
                    Keep track of your interrupted tasks and continue when ready.</p>
                </>
            )}
        </div>
    );
};

export default EmptyComponent;