import React, { useState, useEffect } from "react";
import Icons from "../../utils/icons";

const PaginationComponent = ({
    totalPages,
    itemsPerPage,
    currentPage,
    onPageChange,
    onPageSizeChange,
    isExport,
    onExcelClick,
    isDownloadLoading
}) => {

    const [selectedPageSize, setSelectedPageSize] = useState(itemsPerPage);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; 

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pageNumbers.push(i);
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push("...");
                for (let i = totalPages - 2; i <= totalPages; i++) pageNumbers.push(i);
            } else {
                pageNumbers.push(1);
                pageNumbers.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const handlePageSizeChange = (e) => {
        const newPageSize = parseInt(e.target.value, 10);
        setSelectedPageSize(newPageSize);
        onPageSizeChange(newPageSize);
        onPageChange(1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="section-pagination">
            <div className="pagination-container">
                <div className="page-size-selector">
                    <label htmlFor="page-size">Row Count </label>
                    <select
                        id="page-size"
                        value={selectedPageSize}
                        onChange={handlePageSizeChange}
                        className="page-size-dropdown"
                    >
                        <option id="page-size-10" value={10}>10</option>
                        <option id="page-size-20" value={20}>20</option>
                        <option id="page-size-30" value={30}>30</option>
                    </select>
                </div>

                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="prev-link" onClick={handlePrevPage} id="prev-page-btn">
                            <img src={Icons.caret_left}></img>
                        </button>
                    </li>

                    {getPageNumbers().map((page, index) => (
                        <li
                        key={index}
                        className={`page-item ${page === currentPage ? "active" : ""} ${page === "..." ? "dots" : ""}`}
                        >
                        <button
                             id={`page-item-${page}`}
                            className="page-link"
                            onClick={() => page !== "..." && onPageChange(page)}
                            disabled={page === "..." || page === currentPage}
                        >
                            {page === "..." ? "\u22EF" : page} 
                        </button>
                    </li>                
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="next-link" onClick={handleNextPage} id="next-page-btn">
                            <img src={Icons.caret_next}></img>
                        </button>
                    </li>
                </ul>
                {isExport ? (
                    <>
                        {isDownloadLoading ? (
                        <button
                            type="button"
                            variant="primary"
                            onClick={() => onExcelClick()}
                            disabled={isDownloadLoading}
                            className="excel-button"
                            id="downloading-excel-btn"
                        >
                            <img src={Icons.spinner_blue} alt="Downloading..." className="spinner" />
                            <span>Downloading...</span>
                        </button>
                        ) : (
                        <button
                            type="button"
                            variant="primary"
                            onClick={() => onExcelClick()}
                            disabled={isDownloadLoading}
                            className="excel-button"
                            id="download-excel-btn"
                        >
                            <img src={Icons.exls} alt="Download Excel" />
                            <span>Download Excel</span>
                        </button>
                        )}
                    </>
                ): <div className="non-excel-space"></div>}
            </div>

        </div>
    );
};

export default PaginationComponent;