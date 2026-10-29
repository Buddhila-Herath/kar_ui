import React, { useState, useEffect } from 'react';
import AvailableJobs from '../jobs/available-jobs/AvailableJobs';
import Myjobs from '../jobs/my-jobs/MyJobs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllJobs, fetchMyJobs, updateJobStatus, claimJob } from '../../slices/jobSlice';
import Spinner from "../../shared/components/loaders/Spinner";

const Jobs = (props) => {
  // const { allJobs, myJobs, allJobsLoading, error } = useSelector((state) => state.jobs);
  const { allJobsLoading, error } = useSelector((state) => state.jobs);
  const {formattedMessage} = props;
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();

  const handleClaimJob = (jobId) => {
    dispatch(claimJob(jobId))
      .unwrap()
      .then(() => {
        dispatch(fetchAllJobs());
      })
      .catch(error => {
        console.error('Error claiming job:', error);
      });
  };

  useEffect(() => {
    dispatch(fetchAllJobs());
    dispatch(fetchMyJobs());
  }, [dispatch]);
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const allJobs = [
    {
      jobId: '1',
      title: 'Office Cleaning',
      location: 'Downtown',
      date: '2023-06-15',
      time: '09:00 AM',
      duration: '2 hours',
      price: '$50',
      status: 'available'
    },
    {
      jobId: '2',
      title: 'Window Washing',
      location: 'Business District',
      date: '2023-06-16',
      time: '10:00 AM',
      duration: '3 hours',
      price: '$75',
      status: 'available'
    },
    {
      jobId: '3',
      title: 'Carpet Cleaning',
      location: 'Corporate Center',
      date: '2023-06-17',
      time: '01:00 PM',
      duration: '4 hours',
      price: '$120',
      status: 'available'
    }
  ];
  
  const myJobs = [
    {
      jobId: '4',
      title: 'Janitorial Service',
      location: 'Main Street',
      date: '2023-06-18',
      time: '08:00 AM',
      duration: '5 hours',
      price: '$150',
      status: 'in-progress'
    },
    {
      jobId: '5',
      title: 'Floor Polishing',
      location: 'Financial District',
      date: '2023-06-19',
      time: '11:00 AM',
      duration: '2 hours',
      price: '$90',
      status: 'completed'
    }
  ];

  return (
      <div className="job-container">
        <div className="job-tab-header">
          <div className={`tab-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => handleTabClick(0)}>
            <h4>{formattedMessage("dashboard.available-jobs")}</h4>
            <h4 className="tab-count">{allJobs.length.toString().padStart(2, '0')}</h4>
          </div>
          <div className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleTabClick(1)}>
            <h4>{formattedMessage("dashboard.my-jobs")}</h4>
            <h4 className="tab-count">{myJobs.length.toString().padStart(2, '0')}</h4>
          </div>
        </div>
        {allJobsLoading ? <Spinner /> : <>
        <div className="content-separator" />
        { activeTab === 0 && (
          <AvailableJobs jobs={allJobs} handleClaimJob={handleClaimJob} />
        )}
        {activeTab === 1 && (
          <Myjobs allMyJobs={myJobs} formattedMessage={formattedMessage} updateJobStatus={updateJobStatus} />
        )}
        </>
        }
      </div>
  );
};

export default Jobs;
