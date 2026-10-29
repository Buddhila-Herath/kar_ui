import React, { useEffect, useRef, useState } from "react";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import { placeholderText } from "../../shared/sharedMethod";
import Widget from "./Widget";
import { getFormattedMessage } from "../../shared/sharedMethod";
import RecentlyJoinedVendors from "./RecentlyJoinedVendors";
import { useDispatch, useSelector } from "react-redux";
import InventoryUpdatesWidget from "./InventoryUpdatesWidget";

const AdminDashboard = () => {
  const dispatch = useDispatch();

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("dashboard.title")} />
      <Widget formattedMessage={getFormattedMessage} />
      <div className="recently-joined-vendors">
      <RecentlyJoinedVendors />
      <InventoryUpdatesWidget />
      </div>
    </MasterLayout>
  );
};

export default AdminDashboard;
