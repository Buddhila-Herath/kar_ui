import React, { useState, useEffect, useRef } from 'react';
import { Carousel } from 'antd';
import AvailableJobCard from './AvailableJobCard';
import AvailableJobDetail from './AvailableJobDetail';
import { fetchJobDetails } from '../../../slices/jobSlice';
import { useDispatch, useSelector } from 'react-redux';

const AvailableJobs = (props) => {
  const { jobDetails, checklists } = useSelector((state) => state.jobs);
  const { jobs, handleClaimJob } = props;
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1150);
  const [slidesToShow, setSlidesToShow] = useState(window.innerWidth >= 768 ? 2 : 1);
  const jobListRef = useRef(null);
  const jobDetailRef = useRef(null);
  const jobCarouselRef = useRef(null);
  const [jobListHeight, setJobListHeight] = useState('auto');
  const dispatch = useDispatch(); 

  const handleJobOverview = (jobId) => {
    setSelectedJob(jobId);
    dispatch(fetchJobDetails(jobId));
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
        setIsDesktop(window.innerWidth >= 1150);
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
          <AvailableJobCard
            key={index}
            job={job}
            onClickOverview={handleJobOverview}
            onClickClaim={handleClaimJob}
          />
        ))}
      </div>
    ) : (
      <div className="job-detail-view">
        <div className="job-list-content" ref={jobListRef} style={{ height: jobListHeight }}>
          {isDesktop ? (
            jobs.map((job, index) => (
              <AvailableJobCard
                key={index}
                job={job}
                isSelected={selectedJob && selectedJob === job.jobId}
                onClickOverview={handleJobOverview}
                onClickClaim={handleClaimJob}
              />
            ))
          ) : (
            <>
              <Carousel ref={jobCarouselRef} dots={false} infinite={false} slidesToShow={slidesToShow} slidesToScroll={slidesToShow} draggable>
                {jobs.map((job, index) => (
                  <AvailableJobCard
                    key={index}
                    job={job}
                    isSelected={selectedJob && selectedJob === job.jobId}
                    onClickOverview={handleJobOverview}
                    onClickClaim={handleClaimJob}
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
        <AvailableJobDetail
          selectedJob={selectedJob}
          onClickClaim={handleClaimJob}
          onBackButtonClick={handleBackButtonClick}
          jobDetails={jobDetails || {}}
          checklists={checklists}
          ref={jobDetailRef}
        />
      </div>
    )
  );
}

export default AvailableJobs;