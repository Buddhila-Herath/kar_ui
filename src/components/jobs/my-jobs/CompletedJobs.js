import React, { useState, useEffect, useRef } from 'react';
import { Carousel } from 'antd';
import CompletedJobCard from './CompletedJobCard';
import CompletedJobDetail from './CompletedJobDetail';
import { fetchMyJobDetails } from '../../../slices/jobSlice';
import { useDispatch, useSelector } from 'react-redux';

const CompletedJobs = (props) => {
  const { myJobDetails, myJobchecklists, technicianJobStatus, technicianJobId } = useSelector((state) => state.jobs);
  const {jobs} = props;
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1198);
  const [slidesToShow, setSlidesToShow] = useState(window.innerWidth >= 768 ? 2 : 1);
  const jobListRef = useRef(null);
  const jobDetailRef = useRef(null);
  const jobCarouselRef = useRef(null);
  const [jobListHeight, setJobListHeight] = useState('auto');
  const dispatch = useDispatch(); 

  const handleViewJob = (job) => {
    setSelectedJob(job);
    dispatch(fetchMyJobDetails(job));
  };

  const handleBackButtonClick = () => {
    setSelectedJob(null);
  };

  useEffect(() => {
    let resizeTimeout = null;

    const adjustHeights = () => {
      if (jobListRef.current && jobDetailRef.current) {
        const jobDetailHeight = jobDetailRef.current.offsetHeight;

        // Set the height of the job list to match the job detail height
        setJobListHeight(jobDetailHeight);

        // Enable scroll if job list exceeds job detail height
        jobListRef.current.style.overflowY = jobListRef.current.scrollHeight > jobDetailHeight ? 'scroll' : 'hidden';
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsDesktop(window.innerWidth >= 1198);
        setSlidesToShow(window.innerWidth >= 768 ? 2 : 1);
        adjustHeights();
      }, 100);
    };

    // Trigger the adjustment initially and when the window resizes
    adjustHeights();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    }
  }, [selectedJob]);

  useEffect(() => {
    if (!isDesktop && selectedJob !== null && jobCarouselRef.current) {
      const selectedIndex = jobs.findIndex(job => job.jobId === selectedJob);
      if (selectedIndex !== -1) {
        jobCarouselRef.current.goTo(selectedIndex, false);
      }
    }
  }, [selectedJob, isDesktop]);

  return (
    selectedJob === null ? (
      <div className="tab-content">
        {jobs.map((job, index) => (
          <CompletedJobCard
            key={index}
            job={job}
            onClickView={handleViewJob}
          />
        ))}
      </div>
    ) : (
      <div className="job-detail-view">
        <div className="job-list-content" ref={jobListRef} style={{ height: jobListHeight }}>
          {isDesktop ? (
            jobs.map((job, index) => (
              <CompletedJobCard
                key={index}
                job={job}
                isSelected={selectedJob && selectedJob === job.jobId}
                onClickView={handleViewJob}
              />
            ))
          ) : (
            <>
              <Carousel ref={jobCarouselRef} dots={false} infinite={false} slidesToShow={slidesToShow} slidesToScroll={slidesToShow} draggable>
              {jobs.map((job, index) => (
                  <CompletedJobCard
                    key={index}
                    job={job}
                    isSelected={selectedJob && selectedJob === job.jobId}
                    onClickView={handleViewJob}
                  />
                ))}
              </Carousel>
              <div className="job-carousel">
                {Array.from({ length: Math.ceil(jobs.length / slidesToShow) }).map((_, index) => (
                  <div key={index} className="carousel-nav" onClick={() => jobCarouselRef.current.goTo(index * slidesToShow)} />
                ))}
              </div>
            </>
          )}
        </div>
        <CompletedJobDetail
          onBackButtonClick={handleBackButtonClick}
          jobDetails={myJobDetails || {}}
          checklists={myJobchecklists}
          technicianJobStatus={technicianJobStatus}
          technicianJobId={technicianJobId}
          ref={jobDetailRef}
        />
      </div>
    )
  );
}

export default CompletedJobs;