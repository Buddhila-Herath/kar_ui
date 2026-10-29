import React, { useEffect, useState } from "react";
import Icons from "../../../utils/icons";
import EditRateCard from "./EditRateCard";
import { useDispatch, useSelector } from 'react-redux';
import Spinner from "../../../shared/components/loaders/Spinner";
import { fetchAllGlobalRateCards } from '../../../slices/vendor/systemConfigurationSlice';
import { Tokens } from "../../../constants";

const RateCardConfiguration = () => {
  const dispatch = useDispatch();
  const { globalRateCards, isLoading, error } = useSelector((state) => state.systemConfiguration);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rateCard, setRateCard] = useState(null);
  const globalRateCard = localStorage.getItem(Tokens.GLOBAL_RATE_CARD);

  const handleModalOpen = (rateCard) => {
    setIsModalOpen(true);
    setRateCard(rateCard);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setRateCard(null);
  };

  const formatRate = (rate) => {
    return rate !== null && rate !== undefined ? rate.toFixed(2) : '-';
  };

  useEffect(() => {
    dispatch(fetchAllGlobalRateCards());
  }, [dispatch]);

  return (
    <>
      {isLoading ? <Spinner /> :
      <div className="ratecard-container rate-card-configuration-container">
        <div className="rate-cards-wrapper">
          {globalRateCards.map((rateCard, index) => (
            <div key={rateCard.rateCardId || `rate-card-${index}`} className="rate-card">
              <div className="rate-card-header">
                <span className="rate-card-title">{rateCard && rateCard.rateTypeName? rateCard.rateTypeName : "Untitled"}</span>
                { globalRateCard === "false" && (
                <img
                  src={Icons.pencil_simple_line}
                  alt="edit"
                  className="edit-icon"
                  onClick={() => handleModalOpen(rateCard)}
                />
                )}
              </div>
              <div className="rate-card-body">
                <div className="rate-card-item">
                  <span className="item-label">Base Rate/Hour</span>
                  <span className="item-value">{rateCard && rateCard.baseRatePerHour ? formatRate(rateCard.baseRatePerHour) : '-'}</span>
                </div>
                <div className="rate-card-item">
                  <span className="item-label">Additional Charges/Hour</span>
                  <span className="item-value">
                    {rateCard && rateCard.additionalCharges ? formatRate(rateCard.additionalCharges) : '-'}
                  </span>
                </div>
                <div className="rate-card-item">
                  <span className="item-label">Discount/Hour</span>
                  <span className="item-value">{rateCard && rateCard.discount ? rateCard.discount + '%' : '-'}</span>
                </div>
                <div className="rate-card-item">
                  <span className="item-label">Total Rate Per Hour</span>
                  <span className="item-value">
                  {rateCard && rateCard.totalRatePerHour ? formatRate(rateCard.totalRatePerHour) : '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      }
      {isModalOpen && (
        <EditRateCard
          rateCard={rateCard}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default RateCardConfiguration;
