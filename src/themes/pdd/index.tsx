// 骚猪主题
import React from 'react';
import { Theme } from '../interface';
import { DefaultSoundNames, defaultSounds } from '../default';
import bgm from './sounds/bgm.mp3';

const imagesUrls = import.meta.glob('./images/*.png', {
    import: 'default',
    eager: true,
});

const images = Object.entries(imagesUrls).map(([key, value]) => ({
    name: key.slice(9, -4),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    content: <img src={value} alt="" />,
}));

export const pddTheme: Theme<DefaultSoundNames> = {
    title: '🐷猪了个猪🐷',
    name: '骚猪',
    bgm: 'https://m10.music.126.net/20220922020823/e92de2ba173e404bab61a4719b8d624b/ymusic/0759/010e/0e5d/03e18aa0e96daf33193797e61f6a314d.mp3',
    icons: images.map(({ name, content }) => ({
        name,
        content,
        clickSound: 'button-click',
        tripleSound: 'triple',
    })),
    sounds: defaultSounds,
};
