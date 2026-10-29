import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../../rootReducer';
import Login from '../../../components/auth/Login';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

const store = configureStore({ reducer: rootReducer });

const messages = {
    "login-form.title": "Login",
    "globally.input.email.placeholder.label": "Email",
    "user.input.password.placeholder.label": "Password",
    "login-form.login-btn.label": "Login",
    "login-form.forgot-password.label": "Forgot Password?",
    "login-form.remember-me.label": "Remember me",
    "user.input.password.label": "Password",
    "globally.input.email.label": "Email"
};

test('checking component loaded', () => {
    render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true}}>
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    <Login />
                </IntlProvider>
            </Provider>
        </MemoryRouter>
    );
    expect(screen.getByText(/Login/i, { selector: 'h1' })).toBeInTheDocument();
});