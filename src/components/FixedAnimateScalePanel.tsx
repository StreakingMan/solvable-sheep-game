import React, { FC, ReactNode, useState } from 'react';
import style from './FixedAnimateScalePanel.module.scss';
import classNames from 'classnames';

export const FixedAnimateScalePanel: FC<{
    children: ReactNode;
    className?: string;
    openClassName?: string;
    closeClassName?: string;
    initOpen?: boolean;
}> = ({
    children,
    className,
    openClassName,
    closeClassName,
    initOpen = false,
}) => {
    const [open, setOpen] = useState<boolean>(initOpen);
    return (
        <div
            onClick={() => !open && setOpen(true)}
            className={classNames(
                style.panel,
                open && style.open,
                className,
                open ? openClassName : closeClassName
            )}
        >
            {children}
            <div className={style.closeBtn} onClick={() => setOpen(false)}>
                <svg
                    width="13"
                    height="14"
                    viewBox="0 0 13 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.9498 7.04945L0 11.9993L1.41421 13.4135L6.36401 8.46367L11.3138 13.4135L12.728 11.9993L7.77823 7.04945L12.7279 2.09976L11.3137 0.685547L6.36401 5.63524L1.41432 0.685547L0.0001055 2.09976L4.9498 7.04945Z"
                        fill="#888888"
                    />
                </svg>
            </div>
        </div>
    );
};
