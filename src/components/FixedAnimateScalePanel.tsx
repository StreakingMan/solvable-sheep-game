import React, { FC, ReactNode, useState } from 'react';
import style from './FixedAnimateScalePanel.module.scss';
import classNames from 'classnames';
import { CloseIcon } from './CloseIcon';

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
                <CloseIcon fill={'#888'} />
            </div>
        </div>
    );
};
