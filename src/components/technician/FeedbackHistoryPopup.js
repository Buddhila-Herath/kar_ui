import React from "react";
import profile_avatar from "../../../assets/images/empty-profile-picture.svg";
import Icons from "../../../utils/icons"

const FeedbackHistoryPopup = () => {
 

  return (
    <div className="popup-dropdown" id="technician-feedback-history-popup">
      <div className="popup-header" id="technician-feedback-history-header">
        <h2 id="technician-feedback-history-title">History of Feedbacks</h2>
        <button
          className="close-btn"
          id="technician-feedback-history-close">
          <img src={Icons.close_icon} id="technician-feedback-history-close-icon" />
        </button>
      </div>
      <div className="feedback-list" id="technician-feedback-history-list">
        <div className="feedback-image" id="technician-feedback-history-image-0">
          <img src={profile_avatar} alt="Profile Photo" id="technician-feedback-history-avatar-0" />
        </div>
        <div className="feedback-card" id="technician-feedback-history-card-0">
          <h3 id="technician-feedback-history-name-0">John Doe</h3>
          <p id="technician-feedback-history-message-0">The customer has decided not to paint the living room; awaiting
            confirmation to proceed with the next steps.</p>
          <span className="feedback-time" id="technician-feedback-history-time-0">• 34min ago</span>
        </div>
        <div className="feedback-image" id="technician-feedback-history-image-1">
            <img src={profile_avatar} alt="Profile Photo" id="technician-feedback-history-avatar-1" />
        </div>
        <div className="feedback-card" id="technician-feedback-history-card-1">
          <h3 id="technician-feedback-history-name-1">John Doe</h3>
          <p id="technician-feedback-history-message-1">The customer has decided not to paint the living room; awaiting
            confirmation to proceed with the next steps.</p>
          <span className="feedback-time" id="technician-feedback-history-time-1">• 34min ago</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackHistoryPopup;
