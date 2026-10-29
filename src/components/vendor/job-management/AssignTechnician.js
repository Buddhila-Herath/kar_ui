import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import Icons from "../../../utils/icons";
import CustomRadioSelect from "../../../shared/select/CustomRadioSelect";
import CustomSelect from "../../../shared/select/CustomSelect";

const AssignTechnician = ({
  isModalOpen,
  handleModalClose,
  modalTitle,
  technicians = [],
  quoteServiceId,
  onSubmit,
  getAssignedTechnicianData,
  onSuccess
}) => {
  const [selectedAssistantTechnicians, setSelectedAssistantTechnicians] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMainTechnician, setSelectedMainTechnician] = useState(null);

  const getTechnicianNameById = (id) => {
    const tech = technicians.find(t => t.value === id || t.id === id);
    return tech ? tech.label || tech.name : id;
  };

  const technicianOptions = technicians.map(option => ({
    label: option.label,
    value: option.value
  }));
  
  useEffect(() => {
    if (!isModalOpen) {
      setSelectedMainTechnician({
        label: "",
        value: ""
      });
      setSelectedAssistantTechnicians([]);
      setErrors({});
      setSuccessMessage("");
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && getAssignedTechnicianData) {
      setSelectedMainTechnician({
        label: "",
        value: ""
      });
      setSelectedAssistantTechnicians([]);
      // Initialize main technician
      if (getAssignedTechnicianData.mainTechnicianId) {
        const mainTech = technicians.find(t => t.value === getAssignedTechnicianData.mainTechnicianId);
        if (mainTech) {
          setSelectedMainTechnician({
            label: mainTech.label,
            value: mainTech.value
          });
        }
      }

      // Initialize assistant technicians
      if (getAssignedTechnicianData.assistantTechnicians?.length) {
        const assistantTechs = getAssignedTechnicianData.assistantTechnicians.map(tech => {
          const foundTech = technicians.find(t => t.value === tech.id);
          return foundTech || { 
            label: tech.name || getTechnicianNameById(tech.id), 
            value: tech.id 
          };
        });
        setSelectedAssistantTechnicians(assistantTechs);
      }
    }
  }, [isModalOpen, getAssignedTechnicianData, technicians]);

  const handleMainTechnicianChange = (selectedOption) => {
    setSelectedMainTechnician(selectedOption);
    setErrors(prev => ({ ...prev, mainTechnician: null }));
  };

  const handleAssistantTechniciansChange = (selectedOptions) => {
    const assistantTechs = selectedOptions.map(tech => {
      const foundTech = technicians.find(t => t.value === tech);
      return foundTech || { 
        label: tech.name || getTechnicianNameById(tech.id), 
        value: tech.id 
      };
    });
    setSelectedAssistantTechnicians(assistantTechs);
  };

  const handleAssignTechnicians = async () => {
    const newErrors = {};
    if (!selectedMainTechnician?.value) {
      newErrors.mainTechnician = "Please select a main technician";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        quoteServiceId,
        mainTechnicianId: selectedMainTechnician.value,
        assistantTechnicianIds: selectedAssistantTechnicians.map(t => t.value)
      };

      const result = await onSubmit(payload);
      if (result.response === "Technicians Assigned") {
        setErrors({ formError: "" });
        setSuccessMessage("Technicians assigned successfully!");
        setTimeout(() => {
          setSuccessMessage("");
          handleClose();
          onSuccess();
        }, 1000);
      } else if (result?.error) {
        setErrors({
          formError: result.errors?.[0] || result.message || "Failed to assign technicians"
        });
      } else {
        setErrors({
          formError: "Unexpected response from server"
        });
      }
    } catch (error) {
      setErrors({
        formError: error.message || "Failed to assign technicians"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMainTechnician({
      label: "",
      value: ""
    });
    setSelectedAssistantTechnicians([]);
    setErrors({});
    setSuccessMessage("");
    
    handleModalClose();
  };

  const assistantTechs = selectedAssistantTechnicians;

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={860}
      height={520}
      title={<h3>{modalTitle}</h3>}
      className="add-modal assign-technician-modal"
      style={{ overflow: "auto" }}
    >
      <div className="add-modal-section">
        <div className="form-item form-item__full">
          <CustomRadioSelect
            options={technicianOptions}
            key={`main-tech-select-${quoteServiceId}`} 
            id={`main-tech-select-${quoteServiceId}`}
            required={true}
            placeholderText="Select technician "
            onChange={handleMainTechnicianChange}
            value={selectedMainTechnician ? selectedMainTechnician.value : getAssignedTechnicianData?.mainTechnicianId}
          />
          <label className="form-label required" htmlFor="main-technician">
            <h4>Main Technician</h4>
          </label>
          {errors.mainTechnician && (
            <div className="field-error">
              <img src={Icons.warning_circle} alt="Warning Icon" />
              <h6>{errors.mainTechnician}</h6>
            </div>
          )}
        </div>

        <div className="form-item form-item__full assign-tech">
          <CustomSelect
            groupedOptions={technicianOptions}
            dropdownPlaceholderText="Select assist technician"
            required
            className={`assign-tech-dropdown ${errors.assistantTechnicians ? "invalid" : ""}`}
            isValid={errors.assistantTechnicians ? "invalid" : ""}
            value={selectedAssistantTechnicians.map(tech => tech.value)} 
            onChange={handleAssistantTechniciansChange}
            id={`select-technician-${quoteServiceId}`}
          />
          <label className="form-label" htmlFor="assistant-technician">
            <h4>Assistant Technicians</h4>
          </label>
          {errors.assistantTechnicians && (
            <div className="field-error">
              <img src={Icons.warning_circle} alt="Warning Icon" />
              <h6>{errors.assistantTechnicians}</h6>
            </div>
          )}
        </div>

        <div className="add-modal-button">
          <button
            className="button"
            onClick={handleAssignTechnicians}
            disabled={loading}
            id="submit-assign-technician-modal-btn"
          >
            {loading ? "Assigning..." : "Assign Technicians"}
          </button>
        </div>

        {errors.formError && (
          <div className="field-error">
            <img src={Icons.warning_circle} alt="Warning Icon" />
            <h6>{errors.formError}</h6>
          </div>
        )}

        {successMessage && (
          <div className="field-success">
            <img src={Icons.check} alt="Success Icon" />
            <h6>{successMessage}</h6>
          </div>
        )}
      </div>
      
      <div className="separator" />
      <div className="add-modal-section add-modal-section__list">
        {(selectedMainTechnician && selectedMainTechnician.value) || getAssignedTechnicianData?.mainTechnicianId ? (
          <div className="add-modal-list-container">
            <div className="add-modal-list-heading">
              <h4>Main Technician</h4>
            </div>
            <div className="add-modal-main-list">
              <div className="add-modal-main-list-item">
                <span>{selectedMainTechnician?.label || getAssignedTechnicianData?.mainTechnician}</span>
              </div>
            </div>

            <div className="add-modal-list-heading">
              <h4>Assistant Technicians</h4>
              <div className="add-modal-list-count">
                <h6>{`${assistantTechs.length} Record${assistantTechs.length === 1 ? '' : 's'}`}</h6>
              </div>
            </div>

            <div className="add-modal-list">
              {assistantTechs.length > 0 ? (
                assistantTechs.map((tech, index) => (
                  <React.Fragment key={tech.value || tech.id || index}>
                    <div className="add-modal-list-item">
                      <span>{tech.label || tech.name}</span>
                    </div>
                    {index < assistantTechs.length - 1 && (
                      <div className="separator" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="add-modal-no-data-container no-data">
                  <img src={Icons.technician_three} alt="technician" />
                  <div className="no-data-message">
                    <h2>No Assistant Technicians!</h2>
                    <span>Please assign assistant technicians.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="add-modal-no-data-container">
            <img src={Icons.technician_three} alt="technician" />
            <div className="no-data-message">
              <h2>No Technicians!</h2>
              <span>
                Please assign technicians to view its corresponding technicians.
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AssignTechnician;