import React from "react";
import Icons from '../../utils/icons';

const EmptyComponent = (props) => {
    const {
        globalSetting,
        noRecordsMessage,          // Message when there are no records
        globalSettingOffMessage,   // Message when global setting is off
        noFilterMatchMessage       // Message when no data matches the filter
    } = props;


    let message;
     if (props.isFilterApplied) {
        message = noFilterMatchMessage;
    } else if (globalSetting === "false" || globalSetting === false) {
        message = globalSettingOffMessage;
    } else {
        message = noRecordsMessage;
    }

    return (
        <div className='no-data-container'>
            <div className="no-data-icon"><img src={Icons.warning_octagon} alt="Warning" /></div>
            <h2>No Data to Show</h2>
            <p>{message}</p>
        </div>
    );
};

export default EmptyComponent;