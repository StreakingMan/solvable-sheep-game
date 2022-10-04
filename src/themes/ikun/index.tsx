import React from 'react';
import { Theme } from '../interface';

import niganma from './sounds/你干嘛哎呦.mp3';
import dajiahao from './sounds/全民制作人大家好.mp3';
import jntm from './sounds/鸡你太美.mp3';
import music from './sounds/music.mp3';
import lianxisheng from './sounds/个人练习生.mp3';
import boom from './sounds/篮球击地.mp3';
import bgm from './sounds/bgm.mp3';

type SoundNames =
    | '你干嘛'
    | '鸡你太美'
    | '全民制作人大家好'
    | 'music'
    | '个人练习生'
    | '篮球击地';

const pictureSoundMap: Record<string, SoundNames> = {
    ['kun']: '全民制作人大家好',
    ['坤舞1']: '篮球击地',
    ['坤舞2']: '个人练习生',
    ['坤舞3']: '篮球击地',
    ['坤舞4']: '你干嘛',
    ['坤舞5']: '个人练习生',
    ['坤舞6']: '鸡你太美',
    ['坤舞7']: 'music',
    ['尖叫鸡']: '鸡你太美',
    ['篮球']: '篮球击地',
};

const sounds: { name: SoundNames; src: string }[] = [
    { name: '你干嘛', src: niganma },
    { name: '鸡你太美', src: jntm },
    { name: '全民制作人大家好', src: dajiahao },
    { name: 'music', src: music },
    { name: '个人练习生', src: lianxisheng },
    { name: '篮球击地', src: boom },
];

const imagesUrls = import.meta.glob('./images/*.png', {
    import: 'default',
    eager: true,
});

const icons = Object.entries(imagesUrls).map(([key, value]) => ({
    name: key.slice(9, -4),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    content: <img src={value} alt="" />,
}));

export const ikunTheme: Theme<SoundNames> = {
    title: '🐔鸡了个鸡🐔',
    bgm,
    icons: icons.map(({ name, content }) => ({
        name,
        content,
        clickSound: pictureSoundMap[name],
        tripleSound: '鸡你太美',
    })),
    sounds,
};
