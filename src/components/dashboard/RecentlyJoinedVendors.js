import React, { useState, useEffect, useRef } from "react";
import Icons from "../../utils/icons";
import profile_avatar from "../../assets/images/empty-profile-picture.svg";
import { useDispatch, useSelector } from "react-redux";
import { Carousel } from "antd";
import Spinner from "../../shared/components/loaders/Spinner";
import { Link } from "react-router-dom";
import ImageModel from "../../shared/components/ImageModel";
import { fetchRecentVendorsData } from "../../slices/admin/adminDashBoardDataSlice";
import { fetchImageByPath } from "../../slices/masterDataSlice";
import ImageWithLoader from "../../shared/components/ImageWithLoader";

// Utility to chunk array
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const RecentlyJoinedVendors = () => {
  const dispatch = useDispatch();
  const carouselRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [imageMap, setImageMap] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const { isRecentVendorDetailsDataLoading, recentVendorDetailsData } =
    useSelector((state) => state.adminDashBoardData);

  useEffect(() => {
    dispatch(fetchRecentVendorsData({ page: "1", size: "15" }));
  }, [dispatch]);

  const vendors = recentVendorDetailsData?.data || [];
  const groupedVendors = chunkArray(vendors, 5);

  // Fetch images for vendors in the current slide only
  useEffect(() => {
    const group = groupedVendors[currentSlide] || [];
    group.forEach((vendor) => {
      if (vendor.profileImage && !imageMap[vendor.profileImage]) {
        dispatch(fetchImageByPath(vendor.profileImage)).then((res) => {
          if (res.payload?.url) {
            setImageMap((prev) => ({
              ...prev,
              [vendor.profileImage]: res.payload.url,
            }));
          }
        });
      }
    });
    // eslint-disable-next-line
  }, [currentSlide, groupedVendors, dispatch]);

  const onClickViewImageModal = (imagePath) => {
    setModalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    
      <div className="recent-vendors-container">
        <div className="recent-vendors-header">
          <h4>Recent Vendors</h4>
          <Link to="/admin/vendor-management">
            <img src={Icons.squar_out} alt="Refresh" />
          </Link>
        </div>
        {isRecentVendorDetailsDataLoading ? (
          <Spinner />
        ) : (
          <div className="vendor-list">
            <Carousel
              ref={carouselRef}
              dots={true}
              afterChange={setCurrentSlide}
              autoplaySpeed={5000}
            >
              {groupedVendors.map((group, index) => (
                <div className="vendor-slide" key={index}>
                  {group.map((vendor, idx) => {
                    const imageSrc =
                      vendor.profileImage && imageMap[vendor.profileImage]
                        ? imageMap[vendor.profileImage]
                        : profile_avatar;

                    return (
                      <div className="vendor-item" key={idx}>
                        <div className="vender-item-img-name-wrapper">
                          <ImageWithLoader
                            src={imageSrc}
                            alt="Vendor Avatar"
                            className="vendor-avatar"
                            loading="lazy"
                            onClick={() => onClickViewImageModal(imageSrc)}
                          />
                          <div className="vendor-details">
                            <h5 className="vendor-name">
                              {vendor.vendorName || "N/A"}
                            </h5>
                            <p className="vendor-email">
                              {vendor.vendorEmail || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="vendor-joined">
                          <p>Joined on:</p>
                          <span>{vendor.vendorJoinedDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </Carousel>
          </div>
        )}
      {isModalOpen && (
        <ImageModel
          className="recent-vender-modal"
          imagePath={modalImage}
          onClose={closeModal}
          imgClassName="recent-vender-modal-img"
        />
      )}
      </div>
  );
};

export default RecentlyJoinedVendors;
