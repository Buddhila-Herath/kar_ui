import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRateCards } from "../../../slices/rateCardSlice";
import {
  getFormattedMessage,
  placeholderText,
} from "../../../shared/sharedMethod";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import Spinner from "../../../shared/components/loaders/Spinner";
import Icons from "../../../utils/icons";
import EditRateCard from "./EditRateCard";

const RateCards = () => {
  const { isRateCardsLoading, allRateCards, totalRecord, totalPages, } = useSelector((state) => state.rateCards);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRateCard, setActiveRateCard] = useState(null);

  const handleEditClick = (rateCard) => {
    setActiveRateCard(rateCard);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setActiveRateCard(null);
  };


  useEffect(() => {
    dispatch(fetchAllRateCards());
  }, [dispatch]);

  const formatRate = (rate) => {
    return rate !== null && rate !== undefined ? rate.toFixed(2) : '-';
  };
  
  return (
    <MasterLayout>
      <Breadcrumb
        current_page="Rate Card Configuration"
      />
      <TopProgressBar  isLoading={isRateCardsLoading} />
      <TabTitle title={placeholderText("rate-cards.title")} />
        <div className="ratecard-container">
          {isRateCardsLoading ? (
            <div className="ratecard-loader-wrapper">
              <Spinner />
            </div>
          ) : (
            <div className="reate-container">
              <h1 className="table-title rate-head">
                {placeholderText("rate-cards.title")}
              </h1>
              <div className="rate-cards-wrapper">
                {allRateCards.map((rateCard) => (
                  <div key={rateCard.id} className="rate-card">
                    <div className="rate-card-content">
                      <div className="rate-card-header">
                        <span className="rate-card-title">
                          {rateCard && rateCard.rateTypeName ? rateCard.rateTypeName : "Untitled"}
                        </span>
                        <img
                          src={Icons.pencil_simple_line}
                          alt="edit"
                          className="edit-icon"
                          id="edit-rate-card"
                          onClick={() => handleEditClick(rateCard)}
                        />
                      </div>
                      <div className="rate-card-body">
                        <div className="rate-card-item">
                          <span className="item-label">Base Rate/Hour</span>
                          <span className="item-value">
                            {formatRate(rateCard.baseRatePerHour)}
                          </span>
                        </div>
                        <div className="rate-card-item">
                          <span className="item-label">Additional Charges/Hour</span>
                          <span className="item-value">
                            {formatRate(rateCard.additionalCharges)}
                          </span>
                        </div>
                        <div className="rate-card-item">
                          <span className="item-label">Discount/Hour</span>
                          <span className="item-value">
                             {rateCard.discount !== null && rateCard.discount !== undefined ? rateCard.discount + '%' : '-'}
                          </span>
                        </div>
                        <div className="rate-card-item">
                          <span className="item-label">Total Rate Per Hour</span>
                          <span className="item-value">
                            {formatRate(rateCard.totalRatePerHour)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
      {isModalVisible && (
        <EditRateCard rateCard={activeRateCard} onClose={handleModalClose} />
      )}
    </MasterLayout>
  );
};

export default RateCards;
