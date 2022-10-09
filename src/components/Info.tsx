import React, { FC } from 'react';
import style from './Info.module.scss';
import { FixedAnimateScalePanel } from './FixedAnimateScalePanel';
export const Info: FC = () => {
    return (
        <FixedAnimateScalePanel
            className={style.info}
            openClassName={style.open}
        >
            <div className={style.icon}>i</div>
            <p>
                bgm素材：
                <a
                    href="https://www.bilibili.com/video/BV1zs411S7sz/"
                    target="_blank"
                    rel="noreferrer"
                >
                    普通DISCO（言洛版）
                </a>
                、
                <a
                    href="https://music.163.com/#/song?id=135022"
                    target="_blank"
                    rel="noreferrer"
                >
                    贫民百万歌星
                </a>
                、
                <a
                    href="https://y.qq.com/n/ryqq/songDetail/0020Nusb3QJGn9"
                    target="_blank"
                    rel="noreferrer"
                >
                    只因你太美
                </a>
            </p>
            <p>
                玩法来源-{'>'}羊了个羊-{'>'}
                <a
                    href="https://play.google.com/store/apps/details?id=tile.master.connect.matching.game"
                    target="_blank"
                    rel="noreferrer"
                >
                    3 Tiles
                </a>
                -{'>'}
                <a
                    href="https://www.bilibili.com/video/BV1zT411N7RT"
                    target="_blank"
                    rel="noreferrer"
                >
                    中国龙
                </a>
            </p>
            <p>仅供交流，禁止商用</p>
        </FixedAnimateScalePanel>
    );
};
