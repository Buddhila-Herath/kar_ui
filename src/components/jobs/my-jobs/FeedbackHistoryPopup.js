import React from "react";
import profile_avatar from "../../../assets/images/empty-profile-picture.svg";
import Icons from "../../../utils/icons"

const FeedbackHistoryPopup = () => {
 

  return (
    <div className="popup-dropdown">
      <div className="popup-header">
        <h2>History of Feedbacks</h2>
        <button
          className="close-btn">
          <img src={Icons.close_icon} />
        </button>
      </div>
      <div className="feedback-list">
        <div className="feedback-image">
          <img src={profile_avatar} alt="Profile Photo" />
        </div>
        <div className="feedback-card">
          <h3>John Doe</h3>
          <p>The customer has decided not to paint the living room; awaiting
            confirmation to proceed with the next steps.</p>
          <span className="feedback-time">• 34min ago</span>
        </div>
        <div className="feedback-image">
            <img src={profile_avatar} alt="Profile Photo" />
        </div>
        <div className="feedback-card">
          <h3>John Doe</h3>
          <p>The customer has decided not to paint the living room; awaiting
            confirmation to proceed with the next steps.</p>
          <span className="feedback-time">• 34min ago</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackHistoryPopup;
