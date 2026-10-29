import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import Icons from "../../../../../utils/icons";

const MobileSwiperSlideComponent = ({
  images = [],
  useCustomPagination = false,
  showSlideNumbers = true,
  showEdit = false
}) => {
  const formatSlideNumber = (index) => {
    return index < 9 ? `0${index + 1}` : `${index + 1}`;
  };

  return (
    <div className="swiper-with-edit-button">

      <div className="swiper-container-wrapper swiper-wrapper-relative">
        <Swiper
          pagination={{
            type: useCustomPagination ? "custom" : "fraction",
            renderCustom: useCustomPagination
              ? (swiper, current, total) => {
                return `${formatSlideNumber(current - 1)} of ${formatSlideNumber(total - 1)}`;
              }
              : undefined,
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {images.map((image, index) => {
            // Dynamically detect image type
            const isPng = image?.startsWith("iVBOR");
            const mimeType = isPng ? "png" : "jpeg";
            const src = `data:image/${mimeType};base64,${image}`;

            return (
              <SwiperSlide className="scroller" key={index}>
                <div className="first-swiper-slider-container" data-swiper-parallax="-200">
                  <div className="car-image-container">
                    {showSlideNumbers && (
                      <div className="title count" data-swiper-parallax="-300">
                        {formatSlideNumber(index)}
                      </div>
                    )}
                    {image ? (
                      <img
                        src={src}
                        alt={`Work Image ${index + 1}`}
                        data-swiper-parallax="-100"
                        className="car-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "path-to-fallback-image.jpg";
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">Image not available</div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        {showEdit && (
          <button
            type="button"
            className="edit-images-button"
            onClick={() => console.log("Edit button clicked")}
          >
            <img
              className="pr-comments-input-edit-icon"
              src={Icons.pencil_simple_line}
              alt="edit-quote"
            />
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileSwiperSlideComponent;
