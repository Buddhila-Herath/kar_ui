import React from "react";
import { getFormattedMessage } from "../../shared/sharedMethod";
import Spinner from "../../shared/components/loaders/Spinner";
import Icons from "../../utils/icons";

const EmptyRecntlyJoined = (props) => {
  const { isLoading, noDataText } = props;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="empty-recent-vendors-container d-none">
          <div className="no-data-container no-data">
            <div className="no-data-icon">
              <img src={Icons.warning_octagon}></img>
            </div>
            <h2>{getFormattedMessage("recent.vendors-no-record-tite")}</h2>
            <p>{getFormattedMessage("recent.vendors-no-record-text")}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EmptyRecntlyJoined;
