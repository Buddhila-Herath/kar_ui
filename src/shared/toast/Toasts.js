import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { removeToast } from '../../slices/toastSlice';
import Toast from './Toast';

const Toasts = props => {
    const {toasts, removeToast} = props;
    return (
        <div>
            {toasts.map(toast => {
                return (
                    <Toast {...toast} key={toast.id} onCancel={() => removeToast(toast.id)}/>
                );
            })}
        </div>
    );
};

Toasts.propTypes = {
    toasts: PropTypes.array,
    removeToast: PropTypes.func,
};

const mapStateToProps = state => {
    return {toasts: state.toasts}
};

export default connect(mapStateToProps, {removeToast})(Toasts);
