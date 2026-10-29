import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import MobileCarView1 from "../../../../../../assets/images/car-template/car-1.png";
import MobileCarView2 from "../../../../../../assets/images/car-template/car-2.png";
import MobileCarView3 from "../../../../../../assets/images/car-template/car-3.png";
import MobileCarView4 from "../../../../../../assets/images/car-template/car-4.png";
import MobileCarView5 from "../../../../../../assets/images/car-template/car-5.png";
import MobileCarView6 from "../../../../../../assets/images/car-template/car-6.png";
import MobileCarView7 from "../../../../../../assets/images/car-template/car-7.png";
import MobileCarView8 from "../../../../../../assets/images/car-template/car-8.png";
import MobileCarView9 from "../../../../../../assets/images/car-template/car-9.png";
import MobileCarView10 from "../../../../../../assets/images/car-template/car-10.png";
import MobileCarView11 from "../../../../../../assets/images/car-template/car-11.png";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Navigation } from "swiper/modules";

// Default image set
const defaultImages = [
  MobileCarView1, 
  MobileCarView2, 
  MobileCarView3, 
  MobileCarView4,
  MobileCarView5,
  MobileCarView6,
  MobileCarView7,
  MobileCarView8,
  MobileCarView9,
  MobileCarView10,
  MobileCarView11,
];

const MobileSwiperSlideComponent = ({ 
  images = defaultImages,
  useCustomPagination = false, // Toggle between "1/11" and "01 of 11" format
  showSlideNumbers = true     // Toggle visibility of the "01" number on each slide
}) => {
  const formatSlideNumber = (index) => {
    // Format numbers as "01", "02", ..., "11"
    return index < 9 ? `0${index + 1}` : `${index + 1}`;
  };

  return (
    <div className="swiper-container-wrapper">
      <Swiper
        pagination={{
          type: useCustomPagination ? "custom" : "fraction",
          renderCustom: useCustomPagination 
            ? (swiper, current, total) => {
                return `${formatSlideNumber(current - 1)} of ${formatSlideNumber(total - 1)}`;
              }
            : undefined
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {images.map((carUrl, index) => (
          <SwiperSlide className="scroller" key={index}>
            <div
              className="first-swiper-slider-container"
              data-swiper-parallax="-200"
            >
              <div className="car-image-container">
                {/* Conditionally render the slide number */}
                {showSlideNumbers && (
                  <div className="title count" data-swiper-parallax="-300">
                    {formatSlideNumber(index)}
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
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MobileSwiperSlideComponent;