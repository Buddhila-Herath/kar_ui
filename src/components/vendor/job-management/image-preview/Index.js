import React, { useEffect, useState } from "react";
import { ModalHeader } from "reactstrap";
// import ThreeSixty from "react-360-view";
import { ReactImageTurntable } from "react-image-turntable";
import { Modal } from "antd";
import "./styles.scss";
import SwiperSlideComponent from "./SwiperSlide";
import MobileSwiperSlideComponent from "./SwiperSlide/MobileViewSwiperSlide";
import Icons from "../../../../utils/icons";
import { JobImageTemplate } from "../../../../constants";
import CarImage1 from "../../../../assets/images/car-template/car-1.png";
import CarImage2 from "../../../../assets/images/car-template/car-2.png";
import CarImage3 from "../../../../assets/images/car-template/car-3.png";
import CarImage4 from "../../../../assets/images/car-template/car-4.png";
import CarImage5 from "../../../../assets/images/car-template/car-5.png";
import CarImage6 from "../../../../assets/images/car-template/car-6.png";
import CarImage7 from "../../../../assets/images/car-template/car-7.png";
import CarImage8 from "../../../../assets/images/car-template/car-8.png";
import CarImage9 from "../../../../assets/images/car-template/car-9.png";
import CarImage10 from "../../../../assets/images/car-template/car-10.png";
import CarImage11 from "../../../../assets/images/car-template/car-11.png";

const images = [
  require("../../../../assets/images/car-360-View/Car1.png"),
  require("../../../../assets/images/car-360-View/Car2.png"),
  require("../../../../assets/images/car-360-View/Car3.png"),
  require("../../../../assets/images/car-360-View/Car4.png"),
  require("../../../../assets/images/car-360-View/Car5.png"),
  require("../../../../assets/images/car-360-View/Car6.png"),
  require("../../../../assets/images/car-360-View/Car7.png"),
  require("../../../../assets/images/car-360-View/Car8.png"),
  require("../../../../assets/images/car-360-View/Car9.png"),
  require("../../../../assets/images/car-360-View/Car10.png"),
  require("../../../../assets/images/car-360-View/Car11.png"),
  require("../../../../assets/images/car-360-View/Car12.png"),
  require("../../../../assets/images/car-360-View/Car13.png"),
  require("../../../../assets/images/car-360-View/Car14.png"),
  require("../../../../assets/images/car-360-View/Car15.png"),
];

const firstCarSet = {
  imageFirstRow: [CarImage1, CarImage2, CarImage3, CarImage4],
  imageSecondRow: [CarImage5, CarImage6, CarImage7, CarImage8],
  imageThirdRow: [CarImage9, CarImage10, CarImage11],
};

const CarPopupDialog = (props) => {
  const { visible, setVisible } = props;

  const [autoRotateState, setAutoRotateState] = useState({
    disabled: true,
    interval: 200,
  });

  return (
    <Modal
      centered
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      width={800}
      className="car-modal"
    >
      <div className="car-popup-modal__header">
        <ModalHeader>{"Image Template"}</ModalHeader>
      </div>

      <div className="car-view-container">
        <div className="car-rotate-360">
          <ReactImageTurntable
            className="rotate-viewer-360"
            images={images}
            autoRotate={{ disabled: autoRotateState }}
            {...props}
          />

          <div className="click-arrow-icon">
            <img src={Icons.left_right_arrow_option} alt="" />
            <span>180°</span>
          </div>
        </div>
        <div className="square-car-bg"></div>

        {/* 180 */}
      </div>

      <div className="car-swiper-wrapper">
        {/* // mobile  */}
        <div className="mobile">
          <MobileSwiperSlideComponent />
        </div>
        <div className="desktop">
          {/* // desktop */}
          <SwiperSlideComponent firstCarSet={firstCarSet} />
        </div>
      </div>

      {/* Table */}
      <div className="car-popup-modal__footer">
        {/* 1st row */}
        <div className="columns-container">
          <ol start={1}>
            <li className="item-label">
              {JobImageTemplate.REAR_SIDE_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.FRONT_RIGHT_SIDE_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.FRONT_SIDE_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.FRONT_LEFT_SIDE_OF_VEHICLE}
            </li>
          </ol>
        </div>
        {/* 2nd row */}
        <div className="columns-container">
          <ol start={5}>
            <li className="item-label">
              {JobImageTemplate.LEFT_SIDE_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.REAR_LEFT_SIDE_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.REAR_SIDE_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.REAR_RIGHT_SIDE_OF_VEHICLE}
            </li>
          </ol>
        </div>
        {/* 3rd row */}
        <div className="columns-container">
          <ol start={9}>
            <li className="item-label">
              {JobImageTemplate.INSTRUMENT_CLUSTER_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.DASHBOARD_OF_VEHICLE}
            </li>
            <li className="item-label">
              {JobImageTemplate.ENGINE_COMPARTMENT_OF_VEHICLE}
            </li>
          </ol>
        </div>
      </div>

      {/* cancel */}
      <div className="add-modal-section">
        <div className="footer add-modal-button">
          <button
            className="pop-cancel-btn add-modal-cancel"
            onClick={() => setVisible(false)}
            id="cancel-car-popup-modal-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CarPopupDialog;
