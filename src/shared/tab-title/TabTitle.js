import React from 'react';
import {Helmet} from 'react-helmet';

const TabTitle = (props) => {
    const { title } = props;

    return (
        <Helmet>
            <title>{title}</title>
            <link rel="icon" type="image/png" href="./../../../public/favicon.ico"  sizes="16x16" />
        </Helmet>
    )
}

export default TabTitle;
