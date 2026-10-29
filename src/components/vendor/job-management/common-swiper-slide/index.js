import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "./styles.scss";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Icons from "../../../../utils/icons";

import { Parallax, Pagination, Navigation } from "swiper/modules";

const CommonSwiperSlide = ({ images = [] ,showEdit = false}) => {
  // If no images, show placeholder message
  if (!images.length) {
    return <div className="no-images-message">No images to display</div>;
  }

  // Split into rows of 3 images each
  const rows = [];
  for (let i = 0; i < images.length; i += 4) {
    rows.push(images.slice(i, i + 4));
  }

    return (
      <div className="swiper-with-edit-button">
        <div className="swiper-wrapper-relative"> 
          <Swiper
            style={{
              "--swiper-navigation-color": "#fff",
              "--swiper-pagination-color": "#fff",
            }}
            speed={600}
            parallax={true}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Parallax, Navigation, Pagination]}
            className="common-main-swiper"
          >
            {rows.map((row, rowIndex) => (
              <SwiperSlide className="scroller-new" key={`row-${rowIndex}`}>
                {row.map((image, index) => {
                  const isPng = image?.startsWith("iVBOR");
                  const mimeType = isPng ? "png" : "jpeg";
                  const src = `data:image/${mimeType};base64,${image}`;

                  return (
                    <div
                      className="first-swiper-container"
                      data-swiper-parallax="-200"
                      key={`image-${rowIndex}-${index}`}
                    >
                      <div className="car-image-container-new">
                        {image ? (
                          <img
                            src={src}
                            alt={`Work Image ${rowIndex * 3 + index + 1}`}
                            data-swiper-parallax="-100"
                            className="car-image-new"
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
                  );
                })}
              </SwiperSlide>
            ))}
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

export default CommonSwiperSlide;
