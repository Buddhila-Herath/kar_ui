import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import JobsContainer from "./JobsContainer";
import EmptyComponent from "./EmptyComponents";
import Stats from "./Stats";
import { fetchAllJobs, fetchJobsCount } from "../../../slices/vendor/jobSlice";
import Spinner from "../../../shared/components/loaders/Spinner";
import FilterComponent from "../../../shared/components/FilterComponent";

const Jobs = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoading, allJobs, jobsCount } = useSelector((state) => ({
    isLoading: state.vendorJobs.isLoading,
    allJobs: state.vendorJobs.allJobs?.data,
    jobsCount: state.vendorJobs.jobsCount
  }));
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("jobsActiveTab");
    return savedTab ? parseInt(savedTab) : 0;
  });
  const [searchTerm, setSearchTerm] = useState("");

  const tabHeaderRef = useRef(null);
  const jobTypes = ["UNASSIGNED", "INQUEUE", "STARTED", "PAUSED", "COMPLETED"];

  const statusDisplayMap = {
    UNASSIGNED: "Unassigned",
    INQUEUE: "inque",
    STARTED: "Started",
    PAUSED: "Paused",
    COMPLETED: "Completed",
  };

  const handleSearch = useCallback((searchText) => {
    setSearchTerm(searchText);
  }, []);

  useEffect(() => {
    if (location.state?.tabIndex !== undefined) {
      setActiveTab(location.state.tabIndex);
      localStorage.setItem("jobsActiveTab", location.state.tabIndex);
    }
  }, [location.state]);

  useEffect(() => {
    const currentJobType = jobTypes[activeTab];
    dispatch(fetchAllJobs({ type: currentJobType, searchTerm }));
  }, [dispatch, activeTab, searchTerm]);

  useEffect(() => {
    const currentJobType = jobTypes[activeTab];
    dispatch(fetchAllJobs({ type: currentJobType, searchTerm }));
  }, [dispatch, activeTab, searchTerm]);

  useEffect(() => {
    dispatch(fetchJobsCount(searchTerm));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    if (!isLoading) {
      scrollToActiveTab();
    }
  }, [isLoading, activeTab]);

  const getJobsForTab = () => {
    if (!allJobs) return [];

    switch (jobTypes[activeTab]) {
      case "UNASSIGNED":
        return allJobs.jobs || [];
      case "INQUEUE":
          return allJobs.jobs || [];
      case "STARTED":
        return allJobs.jobs || [];
      case "PAUSED":
        return allJobs.jobs || [];
      case "COMPLETED":
        return allJobs.jobs || [];
      default:
        return [];
    }
  };

  const currentJobs = getJobsForTab();

  const getJobCount = (type) => {
    if (!allJobs?.jobCounts) return "00";
    
    if (type.toLowerCase() === "inqueue") {
      const count = allJobs.jobCounts.inque || allJobs.jobCounts.inqueue || 0;
      return count.toString().padStart(2, "0");
    }
    
    const count = allJobs.jobCounts[type.toLowerCase()] || 0;
    return count.toString().padStart(2, "0");
  };

  const scrollToActiveTab = () => {
    if (window.innerWidth >= 768) return; 
    
    const childIndex = activeTab * 2; 
    const tabElement = tabHeaderRef.current?.children[childIndex];
    
    if (tabElement && tabHeaderRef.current) {
      tabHeaderRef.current.scrollTo({
        left: tabElement.offsetLeft - 60, 
        behavior: "smooth"
      });
    }
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("jobsActiveTab", tab);
    scrollToActiveTab();
  };

  const [startDate, setStartDate] = useState(new Date());
  const handleDateChange = (date) => {
    setStartDate(date);
  };

  return (
    <MasterLayout>
      <TabTitle title="Job Management" />
      <TopProgressBar isLoading={isLoading && searchTerm === ""} />
      <div className="job-managements">
        <Stats />
        {isLoading && searchTerm === "" ? (
          <Spinner />
        ) : (
          <>
            <div className="job-widgets tab-widget">
              <div className="jobs-search-container">
                    <div className="table-title-section">
                    <span className="table-title">Job Management</span>
                    <span className="table-count">
                    {jobsCount > 0
                        ? jobsCount > 1 
                            ? `${jobsCount.toString().padStart(2, "0")} Jobs` 
                            : `${jobsCount.toString().padStart(2, "0")} Job`
                        : "00 Jobs"
                    }
                    </span>
                </div>
                <FilterComponent handleSearch={handleSearch} />

              </div>
              <div className="my-jobs-tab-header tab-head" ref={tabHeaderRef}>
                <div
                  className={`tab-item unassigned ${activeTab === 0 ? "active" : ""}`}
                  onClick={() => handleTabClick(0)}
                  id='unassigned-jobs'
                >
                  <h2>Unassigned Jobs</h2>
                  <h4 className="tab-count">{getJobCount("unassigned")}</h4>
                </div>
                <div className="tab-separator" />

                <div
                  className={`tab-item ${activeTab === 1 ? "active" : ""}`}
                  onClick={() => handleTabClick(1)}
                  id='in-queue-jobs'
                >
                  <h2>In Queue</h2>
                  <h4 className="tab-count">{getJobCount("inqueue")}</h4>
                </div>
                <div className="tab-separator" />

                <div
                  className={`tab-item ${activeTab === 2 ? "active" : ""}`}
                  onClick={() => handleTabClick(2)}
                  id='started-jobs'
                >
                  <h2>Started Jobs</h2>
                  <h4 className="tab-count">{getJobCount("started")}</h4>
                </div>

                <div className="tab-separator" />
                <div
                  className={`tab-item ${activeTab === 3 ? "active" : ""}`}
                  onClick={() => handleTabClick(3)}
                  id='paused-jobs'
                >
                  <h2>Paused Jobs</h2>
                  <h4 className="tab-count">{getJobCount("paused")}</h4>
                </div>

                <div className="tab-separator" />
                <div
                  className={`tab-item ${activeTab === 4 ? "active" : ""}`}
                  onClick={() => handleTabClick(4)}
                  id='completed-jobs'
                >
                  <h2>Completed Jobs</h2>
                  <h4 className="tab-count">{getJobCount("completed")}</h4>
                </div>
              </div>
              {currentJobs.length > 0 ? (
                <JobsContainer
                  jobs={currentJobs}
                  status={statusDisplayMap[jobTypes[activeTab]]}
                  tabIndex={activeTab}
                />
              ) : (
                <EmptyComponent jobs={`${jobTypes[activeTab]} Jobs`} />
              )}
            </div>
          </>
        )}
      </div>
    </MasterLayout>
  );
};

export default Jobs;
