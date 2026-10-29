import React, {useState} from 'react';
import {placeholderText} from '../sharedMethod';
import Icons from "../../utils/icons";

const FilterComponent = (props) => {
    const {handleSearch} = props;
    const [typingTimeout, setTypingTimeout] = useState(0);

    const sendToParent = (searchText) => {
        handleSearch(searchText);
    };

    const onChangeText = (event) => {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        setTypingTimeout(setTimeout(() => sendToParent(event.target.value), 500));
    };

    return (
        <div className='search-box'>
            <input className='form-control' 
                type='search' 
                id='search'
                autoComplete="off"
                placeholder={placeholderText('Search here...')} aria-label='Search'
                onChange={(e) => onChangeText(e)}/>
            <span className='search-icon'>
                <img src={Icons.magnifying_glass} />
            </span>
        </div>
    )
};

export default FilterComponent;
