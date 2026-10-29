import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import AvailableJobs from "../jobs/available-jobs/AvailableJobs";
import Myjobs from "../jobs/MyJobs";
import { fetchAllJobs, getAvailableMyJobsCount } from "../../../slices/technician/jobSlice";
import Spinner from "../../../shared/components/loaders/Spinner";
import { formatCount } from "../../../utils/helperUtils.js";
import EmptyComponent from "../EmptyComponents.js";
import FilterComponent from "../../../shared/components/FilterComponent";
import FilterDropdown from "../../../shared/filterMenu/FilterDropdown";
import { Filters } from "../../../constants";
import { fetchAllPriorityList } from "../../../slices/masterDataSlice";
import Icons from "../../../utils/icons";
import { format } from "date-fns";

const Jobs = () => {
  const dispatch = useDispatch();

  const { 
    jobsByType = {}, 
    isLoading,
    myJobCounts = { availableJobsCount: 0, myJobsCount: 0 } 
  } = useSelector((state) => state.technicianJobs);

  const { allPriorityList } = useSelector((state) => state.masterData);

  const [activeMainTab, setActiveMainTab] = useState(() => {
    const savedTab = localStorage.getItem("jobsActiveTab");
    return savedTab !== null ? parseInt(savedTab) : 0;
  });

  const [filter, setFilter] = useState({
    page: Filters.OBJ.page,
    size: Filters.OBJ.size,
    searchTerm: "",
    sortField: "",
    sortOrder: Filters.OBJ.order,
    fromDate: null,
    toDate: null,
    priority: [],
  });

  const [reset, setReset] = useState(false);

  const priorityOption = useMemo(() => {
    return (allPriorityList || []).map((option) => ({
      name: option.priority,
      id: option.priority,
      checked: filter.priority?.includes(option.priority),
    }));
  }, [allPriorityList, filter.priority]);

  const isFilterApplied = filter.fromDate || filter.toDate || (filter.priority && filter.priority.length > 0);

  useEffect(() => {
    localStorage.setItem("jobsActiveTab", activeMainTab);
  }, [activeMainTab]);

  const jobTypes = ["AVAILABLE", "TASKTOCOMPLETED", "TASKCOMPLETED"];

  const statusDisplayMap = {
    AVAILABLE: "Available Jobs",
    TASKTOCOMPLETED: "Task to Complete",
    TASKCOMPLETED: "Completed Tasks",
  };

  useEffect(() => {
    dispatch(fetchAllPriorityList());
  }, [dispatch]);

  useEffect(() => {
    // For Available Jobs tab
    if (activeMainTab === 0) {
      dispatch(fetchAllJobs({
        type: jobTypes[0],
        startDate: filter.fromDate || null,
        endDate: filter.toDate || null,
        searchTerm: filter.searchTerm || null,
        priority: filter.priority && filter.priority.length > 0 ? filter.priority : null,
      }));
    } 
    // For My Jobs tab, fetch both sub-tabs data
    else if (activeMainTab === 1) {
      dispatch(fetchAllJobs({
        type: jobTypes[1],
        startDate: filter.fromDate || null,
        endDate: filter.toDate || null,
        searchTerm: filter.searchTerm || null,
        priority: filter.priority && filter.priority.length > 0 ? filter.priority : null,
      })); // Tasks to Complete
      dispatch(fetchAllJobs({
        type: jobTypes[2],
        startDate: filter.fromDate || null,
        endDate: filter.toDate || null,
        searchTerm: filter.searchTerm || null,
        priority: filter.priority && filter.priority.length > 0 ? filter.priority : null,
      })); // Completed Tasks
    }
    dispatch(getAvailableMyJobsCount({
      startDate: filter.fromDate || null,
      endDate: filter.toDate || null,
      searchTerm: filter.searchTerm || null,
      priority: filter.priority && filter.priority.length > 0 ? filter.priority : null,
    }));
  }, [dispatch, activeMainTab, filter.fromDate, filter.toDate, filter.searchTerm, filter.priority]);

  const availableJobs = jobsByType.AVAILABLE?.jobs || [];
  const taskToCompleteJobs = jobsByType.TASKTOCOMPLETED?.jobs || [];
  const taskCompletedJobs = jobsByType.TASKCOMPLETED?.jobs || [];

  // Calculate total job count
  const totalJobCount = (myJobCounts.availableJobsCount || 0) + (myJobCounts.myJobsCount || 0);

  // Filter jobs based on search term
  const filterJobs = (jobs) => {
    if (!filter.searchTerm) return jobs;
    const searchLower = filter.searchTerm.toLowerCase();
    return jobs.filter(job => 
      (job.jobCardId && job.jobCardId.toLowerCase().includes(searchLower)) ||
      (job.quoteName && job.quoteName.toLowerCase().includes(searchLower)) ||
      (job.vehicleRegNumber && job.vehicleRegNumber.toLowerCase().includes(searchLower))
    );
  };

  const filteredAvailableJobs = filterJobs(availableJobs);
  const filteredTaskToCompleteJobs = filterJobs(taskToCompleteJobs);
  const filteredTaskCompletedJobs = filterJobs(taskCompletedJobs);
  const handleMainTabClick = (tab) => {
    setActiveMainTab(tab);
  };

  const handleFilterChange = (filters) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      ...filters,
      page: 1, // Reset to first page when filter changes
    }));
    setReset(false);
  };

  const clearFilter = () => {
    setFilter({
      page: Filters.OBJ.page,
      size: Filters.OBJ.size,
      searchTerm: "",
      sortField: "",
      sortOrder: Filters.OBJ.order,
      fromDate: null,
      toDate: null,
      priority: [],
    });
    setReset(true);
  };

  return (
    <div className="job-container tech-jobs">
      <div className="job-header-section">
        <div className="job-count-section">
          <h4>Job Management</h4>
          {/* <span className="table-count">
            {((totalJobCount) || 0).toString().padStart(2, '0')} {totalJobCount === 1 ? "Job" : "Jobs"}
          </span> */}
        </div>

        <div className="search-filter-section">
          <div className="tech-jobs-filter-wrapper">
            <FilterDropdown
              title="Filter Job Details"
              onhandleFilter={handleFilterChange}
              isReset={reset}
              isDateFilter={true}
              isPriorityFilter={true}
              priorityOption={priorityOption}
              currentFilters={filter}
            />
          </div>
          <div className="search-wrapper">
            <FilterComponent
              handleSearch={(searchText) => {
                setFilter((prev) => ({
                  ...prev,
                  searchTerm: searchText,
                  page: 1,
                }));
              }}
            />
          </div>
        </div>
      </div>

      {isFilterApplied && (
        <div className="active-filters-section tech-applied-filters">
          <div className="applied-filters-container">
            <div className="applied-filters-left">
              <div className="applied-filters-label-section">
              <span className="applied-filters-label">Applied Filters:</span>
                <button className="clear-all-btn clear-all-btn-tech-job tech-filter-mobile-btn" onClick={clearFilter}>
                Clear All
              </button>
              </div>
              <div className="applied-filters-tags">
                {(filter.fromDate || filter.toDate) && (
                  <div className="filter-tag-group applied-filter-tag-date">
                    <span className="filter-tag-label">Date:</span>
                    <div className="filter-tag-content">
                      {filter.fromDate && <span>{format(new Date(filter.fromDate), 'yyyy-MM-dd')}</span>}
                      {(filter.fromDate && filter.toDate) && (
                        <img className="arrow-right-icon" src={Icons.arrow_right} alt="arrow" />
                      )}
                      {filter.toDate && <span>{format(new Date(filter.toDate), 'yyyy-MM-dd')}</span>}
                      <button
                        className="filter-close-btn date-close-btn"
                        onClick={() => {
                          setFilter((prev) => ({ ...prev, fromDate: null, toDate: null }));
                        }}
                      >
                        <img src={Icons.x} alt="close" />
                      </button>
                    </div>
                  </div>
                )}
                {filter.priority && filter.priority.length > 0 && (
                  <div className="filter-tag-group">
                    <span className="filter-tag-label">Priority:</span>
                    <div className="filter-tag-items">
                      {filter.priority.map((priorityId) => {
                        const priorityOption = allPriorityList?.find((p) => p.priority === priorityId);
                        return priorityOption ? (
                          <div key={priorityId} className="filter-tag-item">
                            <span>{priorityOption.priority}</span>
                            <button
                              className="filter-close-btn"
                              onClick={() => {
                                setFilter((prev) => ({
                                  ...prev,
                                  priority: prev.priority.filter((id) => id !== priorityId),
                                }));
                              }}
                            >
                              <img src={Icons.x} alt="close" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="applied-filters-right tech-filter-desktop">
              <button className="clear-all-btn clear-all-btn-tech-job" onClick={clearFilter}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="job-tab-header">
        <div
          id="technician-available-jobs-tab"
          className={`tab-item main-tab ${activeMainTab === 0 ? "active" : ""}`}
          onClick={() => handleMainTabClick(0)}
        >
          <h4>Available Jobs</h4>
          <h4 className="tab-count" id="technician-available-jobs-count">{formatCount(myJobCounts.availableJobsCount)}</h4>
        </div>
        <div
          id="technician-my-jobs-tab"
          className={`tab-item main-tab ${activeMainTab === 1 ? "active" : ""}`}
          onClick={() => handleMainTabClick(1)}
        >
          <h4>My Jobs</h4>
          <h4 className="tab-count" id="technician-my-jobs-count">{formatCount(myJobCounts.myJobsCount)}</h4>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="content-separator" />
          {activeMainTab === 0 ? (
            filteredAvailableJobs.length > 0 ? (
              <AvailableJobs
                jobs={filteredAvailableJobs}
                status={statusDisplayMap[jobTypes[activeMainTab]]}
                tabIndex={activeMainTab}
              />
            ) : availableJobs.length > 0 ? (
              <div className="no-results-message">
                No jobs match your search criteria.
              </div>
            ) : (
              <EmptyComponent jobs="Available Jobs" />
            )
          ) : activeMainTab === 1 ? (
            filteredTaskToCompleteJobs.length > 0 || filteredTaskCompletedJobs.length > 0 ? (
              <Myjobs
                taskToCompleteJobs={filteredTaskToCompleteJobs}
                taskCompletedJobs={filteredTaskCompletedJobs}
                status={statusDisplayMap[jobTypes[activeMainTab]]}
                tabIndex={activeMainTab}
                jobCountDto={jobsByType.TASKTOCOMPLETED?.jobCountDto || { tasktocompleted: 0, taskcompleted: 0}}
              />
            ) : (taskToCompleteJobs.length > 0 || taskCompletedJobs.length > 0) ? (
              <div className="no-results-message">
                No jobs match your search criteria.
              </div>
            ) : (
              <EmptyComponent jobs="My Jobs" />
            )
          ) : null}
        </>
      )}
    </div>
  );
};

export default Jobs;
