import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "./styles.scss";


import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Parallax, Pagination, Navigation } from "swiper/modules";

const SwiperSlideComponent = (props) => {
  const { firstCarSet } = props;

  return (
    <>
      <Swiper
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        }}
        speed={600}
        parallax={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Parallax, Navigation, Pagination]}
        className="mySwiper"
      >
        <SwiperSlide className="scroller">
          {firstCarSet?.imageFirstRow?.map((carUrl, index) => (
            <div
              className="first-swiper-slider-container"
              data-swiper-parallax="-200"
            >
              <div
                className="car-image-container"
                key={index}
              >
                <div className="title" data-swiper-parallax="-300">
                  0{index + 1}
                </div>
                <img
                  src={carUrl}
                  alt={`Premium Car ${index + 1}`}
                  data-swiper-parallax="-100"
                  className="car-image"
                />
              </div>
            </div>
          ))}
        </SwiperSlide>

        <SwiperSlide className="scroller">
          {firstCarSet?.imageSecondRow?.map((carUrl, index) => (
            <div
              className="first-swiper-slider-container"
              data-swiper-parallax="-200"
            >
              <div
                className="car-image-container"
                key={index}
              >
                <div className="title" data-swiper-parallax="-300">
                  0{index + 5}
                </div>
                <img
                  src={carUrl}
                  alt={`Premium Car ${index + 1}`}
                  data-swiper-parallax="-100"
                  className="car-image"
                />
              </div>
            </div>
          ))}
        </SwiperSlide>

        <SwiperSlide className="scroller">
          {firstCarSet?.imageThirdRow?.map((carUrl, index) => (
            <div
              className="first-swiper-slider-container"
              data-swiper-parallax="-200"
            >
              <div
                className="car-image-container"
                key={index}
              >
                {index == 0 ? (
                  <div className="title" data-swiper-parallax="-300">
                    0{index + 9}
                  </div>
                ) : (
                  <div className="title" data-swiper-parallax="-300">
                    {index + 9}
                  </div>
                )}

                <img
                  src={carUrl}
                  alt={`Premium Car ${index + 1}`}
                  data-swiper-parallax="-100"
                  className="car-image"
                />
              </div>
            </div>
          ))}
        </SwiperSlide>
      </Swiper>
    </>
  );
};

export default SwiperSlideComponent;
