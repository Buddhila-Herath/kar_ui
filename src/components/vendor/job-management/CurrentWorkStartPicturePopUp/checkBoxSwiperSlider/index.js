import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./styles.scss";

import CustomCarSelectOption from "./customCarSelectOption";

const CheckBoxSwiperSlider = (props) => {
  const { firstCarSet, handleImageClick } = props;

  return (
    <Swiper
      navigation
      pagination={{ clickable: true }}
      modules={[Navigation, Pagination]}
      className="check-box-main-swiper"
    >
      <SwiperSlide className="scroller first-slide">
        {firstCarSet?.imageFirstRow?.map((carUrl, index) => {
          return (
            <>
            <div
              key={index}
              className="first-swiper-slider-container"
              data-swiper-parallax="-200"
              onClick={() => handleImageClick(carUrl)}
            >
              <CustomCarSelectOption
                imageSrc={carUrl}
                alt={`Premium Car ${index + 1}`}
              />
              
            </div>
            <div className="new-divider-line"> </div>
            </>

          );
        })}
      </SwiperSlide>
      {/* 2nd */}
      <SwiperSlide className="scroller second-slide">
        {firstCarSet?.imageSecondRow?.map((carUrl, index) => {
          return (
            <>
            <div
              key={index}
              className="first-swiper-slider-container"
              data-swiper-parallax="-200"
              onClick={() => handleImageClick(carUrl)}
            >
              <CustomCarSelectOption
                imageSrc={carUrl}
                alt={`Premium Car ${index + 1}`}
              />

              
            </div>
            <div className="new-divider-line"> </div>
            </>
          );
        })}
      </SwiperSlide>
      {/* 3rd */}
      <SwiperSlide className="scroller third-slide">
        {firstCarSet?.imageThirdRow?.map((carUrl, index) => {
          return (
            <>
            <div
              key={index}
              className="first-swiper-slider-container"
              data-swiper-parallax="-200"
              onClick={() => handleImageClick(carUrl)}
            >
              <CustomCarSelectOption
                imageSrc={carUrl}
                alt={`Premium Car ${index + 1}`}
              />

              
            </div>
            <div className="new-divider-line"> </div>
            </>
          );
        })}
      </SwiperSlide>
    </Swiper>
  );
};

export default CheckBoxSwiperSlider;
