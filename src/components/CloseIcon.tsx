import React, { FC, MouseEventHandler } from 'react';

export const CloseIcon: FC<{ fill: string; onClick?: MouseEventHandler }> = ({
    fill,
    onClick,
}) => {
    return (
        <svg
            width="13"
            height="14"
            viewBox="0 0 13 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClick}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.9498 7.04945L0 11.9993L1.41421 13.4135L6.36401 8.46367L11.3138 13.4135L12.728 11.9993L7.77823 7.04945L12.7279 2.09976L11.3137 0.685547L6.36401 5.63524L1.41432 0.685547L0.0001055 2.09976L4.9498 7.04945Z"
                fill={fill}
            />
        </svg>
    );
};
