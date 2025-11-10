import React from 'react';

const MyButton = ({ content, handleAnyThing, classStyle = 'bg-alpha text-dark hover:bg-alpha/10 ' }) => {
    return (
        <>
            <button onClick={handleAnyThing} className={`${classStyle} px-2 py-2 rounded-lg outline-non`}>
                {content}
            </button>
        </>
    );
};

export default Button;