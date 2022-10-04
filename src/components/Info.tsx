import React, { CSSProperties, FC, useState } from 'react';
import style from './Info.module.scss';
import classNames from 'classnames';
export const Info: FC = () => {
    const [open, setOpen] = useState(false);
    return (
        <div
            onClick={() => !open && setOpen(true)}
            className={classNames(style.info, open && style.open)}
        >
            <div className={style.icon}>i</div>
            <p>
                bgm素材：
                <a
                    href="https://www.bilibili.com/video/BV1zs411S7sz/"
                    target="_blank"
                    rel="noreferrer"
                >
                    洛天依，言和原创《普通DISCO》
                </a>
            </p>
            <p>
                玩法来源➡️羊了个羊➡️
                <a
                    href="https://play.google.com/store/apps/details?id=tile.master.connect.matching.game"
                    target="_blank"
                    rel="noreferrer"
                >
                    3 Tiles
                </a>
            </p>
            <p>仅供交流，禁止商用</p>
            <div className={style.close} onClick={() => setOpen(false)}>
                X
            </div>
        </div>
    );
};
