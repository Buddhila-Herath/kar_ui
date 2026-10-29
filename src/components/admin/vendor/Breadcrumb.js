import React from 'react';
import Icons from "../../../utils/icons"

const Breadcrumb = () => {

    return (
        <div className="breadcrumb">
            <a href="/dashboard" className="breadcrumb_link">Dashboard</a>
            <span className="breadcrumb_separator"><img src={Icons.caret_right}></img></span>
            <a href="/vendor-management" className="breadcrumb_link">Vendor Management</a>
            <span className="breadcrumb_separator"><img src={Icons.caret_right}></img></span>
            <a href="/vendors" className="breadcrumb_link--active ">Vendors</a>
        </div>
    );
};

export default Breadcrumb;
