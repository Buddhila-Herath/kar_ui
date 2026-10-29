import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import Vendors from '../../../../components/admin/vendor/Vendors';
import { fetchAllVendors } from "../../../../slices/vendorSlice";
import { IntlProvider } from 'react-intl';

jest.mock("../../../../slices/vendorSlice", () => ({
    fetchAllVendors: jest.fn(),
}));

const mockStore = configureStore([]);

const messages = {
    "vendor.list.title": "Vendors",
    "vendor.add.button.label": "Add Vendor",
};

describe("Vendors Component", () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            vendors: {
                isVendorsLoading: false,
                allVendors: [
                    {
                        vendorPrimaryId: 1,
                        vendorId: "V001",
                        firstName: "John",
                        lastName: "Doe",
                        mobileNumber: "123456789",
                        emailAddress: "john.doe@example.com",
                        nic: "12345-67890",
                        businessName: "John's Supplies",
                        businessAddressLine1: "123 Main St",
                        district: "Central",
                        province: "Province A",
                        businessTelephone: "987654321",
                        businessEmail: "business@example.com",
                        businessTypeSaveRequestDtoList: [
                            { businessRateTypeName: "Type A" },
                            { businessRateTypeName: "Type B" },
                        ],
                        joinDate: "2024-01-01",
                        status: true,
                        registeredBy: "Admin",
                    },
                ],
                totalRecord: 1,
                totalPages: 1,
                error: null,
            },
        });
        store.dispatch = jest.fn();
    });

    it("renders Vendors component", async () => {
        render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    <MemoryRouter>
                        <Vendors />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(screen.getByText(/Vendor Management/i, { selector: 'span' })).toBeInTheDocument();
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("Doe")).toBeInTheDocument();
    });

    it("dispatches fetchAllVendors on load", () => {
        render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    <MemoryRouter>
                        <Vendors />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        expect(fetchAllVendors).toHaveBeenCalledWith({
            page: 1,
            size: 10,
            searchTerm: "",
            status: "",
            businessType: "",
            toDate: "",
            fromDate: "",
        });
    });

    it("toggles delete modal", async () => {
        render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    <MemoryRouter>
                        <Vendors />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
        fireEvent.click(deleteButton);

        await waitFor(() =>
            expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
        );
    });

    it("updates filter on change", async () => {
        render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    <MemoryRouter>
                        <Vendors />
                    </MemoryRouter>
                </IntlProvider>
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText("Search");
        fireEvent.change(searchInput, { target: { value: "John" } });

        await waitFor(() =>
            expect(store.dispatch).toHaveBeenCalledWith(fetchAllVendors(expect.any(Object)))
        );
    });
});
