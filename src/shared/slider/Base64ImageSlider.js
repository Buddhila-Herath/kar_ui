import React, {useState} from 'react';
import { Carousel, Image, ConfigProvider } from 'antd';
import './Base64ImageSlider.css';

const Base64ImageSlider = ({ 
  images, 
  desktopImagesPerPage = 4,
  imgPreview = false,
  isDataType = false,
  isDots = true
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  if (!images || images.length === 0) return null;

  const carouselToken = {
    arrowSize: 24,
    arrowOffset: 30,
    dotWidth: 20,
    dotHeight: 4,
    dotGap: 2,
    dotActiveWidth: 26
  };  

  const handleSlideChange = (current) => {
    setCurrentSlide(current);
  };

  const formatImageSrc = (img) => {
    return img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`;
  };

  // Desktop View 
  const desktopView = (
    <ConfigProvider theme={{ components: { Carousel: carouselToken } }}>
      <div className="desktop-slider">
        <Carousel dots={isDots ? { className: "custom-dots" } : false} arrows={true} infinite={false}>
          {[...Array(Math.ceil(images.length / desktopImagesPerPage))].map((_, i) => {
            const group = images.slice(i * desktopImagesPerPage, (i + 1) * desktopImagesPerPage);
            return (
              <div key={`desktop-${i}`} className="desktop-slide">
                {group.map((img, j) => (
                  <React.Fragment key={`desktop-img-${j}`}>
                    <div className="desktop-image-container">
                      <Image
                        key={i}
                        src={isDataType ? img : `data:image/jpeg;base64,${img}`}
                        alt={`Image ${i * desktopImagesPerPage + j + 1}`}
                        className="desktop-image"
                        preview={imgPreview}
                      />
                    </div>
                    {(j < group.length - 1) && (
                      <div className="image-separator"></div>
                    )}
                    
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </Carousel>
      </div>
    </ConfigProvider>
  );

  // Mobile View
  const mobileView = (
    <ConfigProvider theme={{ components: { Carousel: carouselToken } }}>
      <div className="mobile-slider-container">
        <div className="mobile-slider">
          <Carousel 
            dots={false}
            arrows={true}
            infinite={false}
            afterChange={handleSlideChange}
          >
            {images.map((img, i) => (
              <div key={`mobile-${i}`} className="mobile-slide">
                <div className="mobile-image-wrapper">
                  <Image
                    key={i}
                    src={isDataType ? img : `data:image/jpeg;base64,${img}`}
                    alt={`Image ${i + 1}`}
                    className="mobile-image"
                    preview={imgPreview}
                  />
                </div>
              </div>
            ))}
          </Carousel>
          { isDots && (
            <div className="mobile-pagination">
              {`${(currentSlide + 1).toString().padStart(2, '0')} of ${images.length.toString().padStart(2, '0')}`}
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );

  return (
    <>
      <div className="desktop-view">{desktopView}</div>
      <div className="mobile-view">{mobileView}</div>
    </>
  );
};

export default Base64ImageSlider;