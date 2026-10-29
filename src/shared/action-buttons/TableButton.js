import React from 'react';
import {Button} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAdd} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

const TableButton = ({ButtonValue, to, className, style}) => {
    const navigate = useNavigate();
    
    return(
        <Button id="add-new-btn" type='primary' onClick={() => navigate(to)} className={className} style={style} >
            <FontAwesomeIcon icon={faAdd} /> 
            {ButtonValue}
        </Button>
    )
}

export default TableButton;
