import React from 'react';
import Icons from "../../utils/icons"
import { Link } from "react-router-dom";
import { isAdminPortal } from "../../utils/portalUtils";

const Breadcrumb = (props) => {
    const { 
        parent_menu, 
        parent_menu_url, 
        second_level_page, 
        second_level_page_url, 
        second_level_page_state,
        current_page, 
        current_page_url 
    } = props;

    return (
        <div className="breadcrumb" id="breadcrumb-container">
            {isAdminPortal() ? 
                <Link to="/admin/dashboard" className="breadcrumb_link" id="breadcrumb-dashboard-link">Dashboard</Link>
            :
                <Link to="/app/dashboard" className="breadcrumb_link" id="breadcrumb-dashboard-link">Dashboard</Link>
            }
            { parent_menu_url && (
                <>
                    <span className="breadcrumb_separator"><img src={Icons.caret_right}></img></span>
                    <Link to={parent_menu_url} className="breadcrumb_link" id="breadcrumb-parent-link">{parent_menu}</Link>
                </>
            )}
            {second_level_page && (
                <>
                    <span className="breadcrumb_separator"><img src={Icons.caret_right}></img></span>
                    <Link 
                        to={{
                            pathname: second_level_page_url,
                            state: second_level_page_state
                        }}
                        className="breadcrumb_link"
                        id="breadcrumb-second-level-link"
                    >
                        {second_level_page}
                    </Link>
                </>
            )}
            <>
                <span className="breadcrumb_separator"><img src={Icons.caret_right}></img></span>
                <a className="breadcrumb_link--active" style={{cursor:'auto'}} id="breadcrumb-current-page">{current_page}</a>
            </>
        </div>
    );
};

export default Breadcrumb;
