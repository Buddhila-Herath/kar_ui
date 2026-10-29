import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import Breadcrumb from "../../../shared/breadcrumb/Breadcrumb";
import VehicleForm from "./VehicleForm";
import { fetchVehicleEditViewById } from "../../../slices/vendor/vehicleSlice";
import Spinner from "../../../shared/components/loaders/Spinner";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const EditVehicle = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const vehicle = useSelector(
    (state) => state.vendorVehicle.vehicleEditView,
    shallowEqual
  );
  const isVehicleEditViewLoading = useSelector(
    (state) => state.vendorVehicle.isVehicleEditViewLoading
  );
  const error = useSelector((state) => state.vendorVehicle.error, shallowEqual);

  useEffect(() => {
    if (id) {
      console.log(
        "EditVehicle: Dispatching fetchVehicleEditViewById with id:",
        id
      );
      dispatch(fetchVehicleEditViewById({ id, type: "edit" }));
    }
  }, [id, dispatch]);

  return (
    <MasterLayout>
      <TabTitle title="Edit Vehicle" />
      <Breadcrumb
        parent_menu="Vehicle Management"
        parent_menu_url="/app/vehicle-management"
        current_page="Edit Vehicle"
      />
      <TopProgressBar isLoading={isVehicleEditViewLoading} />
      {vehicle ? (
        <VehicleForm
          key={vehicle?.id || "new"}
          vehicle={vehicle}
          isEdit={true}
          sId={id}
        />
      ) : (
        <Spinner />
      )}
    </MasterLayout>
  );
};

export default EditVehicle;
