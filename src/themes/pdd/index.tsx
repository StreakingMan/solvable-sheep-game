// 骚猪主题
import React from 'react';
import { Theme } from '../interface';
import { defaultSounds } from '../default';
import bgm from './sounds/bgm.mp3';

const soundUrls = import.meta.glob('./sounds/*.mp3', {
    import: 'default',
    eager: true,
});

const sounds = Object.entries(soundUrls).map(([key, value]) => ({
    name: key.slice(9, -4),
    src: value,
})) as Theme<string>['sounds'];

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

export const pddTheme: Theme<string> = {
    title: '🐷猪了个猪🐷',
    desc: (
        <p>
            感谢
            <a
                href="https://space.bilibili.com/81966051"
                target="_blank"
                rel="noreferrer"
            >
                猪酱的日常
            </a>
            提供素材
        </p>
    ),
    name: '骚猪',
    bgm: bgm,
    icons: images.map(({ name, content }) => ({
        name,
        content,
        clickSound: 'button-click',
        tripleSound: name,
    })),
    sounds: [defaultSounds[0], ...sounds],
};
