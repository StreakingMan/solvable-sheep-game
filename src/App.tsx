import React, { FC, useState } from 'react';

import './App.scss';
import {
    LAST_LEVEL_STORAGE_KEY,
    parsePathCustomThemeId,
    parsePathThemeName,
} from './utils';
import { defaultTheme } from './themes/default';
import { Theme } from './themes/interface';
import { fishermanTheme } from './themes/fisherman';
import { jinlunTheme } from './themes/jinlun';
import { ikunTheme } from './themes/ikun';
import { pddTheme } from './themes/pdd';
import { owTheme } from './themes/ow';
import Game from './Game';
import { Loading } from './components/Loading';
import { BeiAn } from './components/BeiAn';

// 内置主题
const builtInThemes: Theme<any>[] = [
    defaultTheme,
    fishermanTheme,
    jinlunTheme,
    ikunTheme,
    pddTheme,
    owTheme,
];
// 从url初始化主题
const themeFromPath = parsePathThemeName(location.href);
const customThemeIdFromPath = parsePathCustomThemeId(location.href);
const initTheme = customThemeIdFromPath
    ? { title: '', icons: [], sounds: [], name: '' }
    : themeFromPath
    ? builtInThemes.find((theme) => theme.name === themeFromPath) ??
      defaultTheme
    : defaultTheme;

// 读取缓存关卡数
const initLevel = Number(localStorage.getItem(LAST_LEVEL_STORAGE_KEY) || '1');

const App: FC = () => {
    console.log('???');
    const [theme, setTheme] = useState<Theme<any>>(initTheme);
    const [loading, setLoading] = useState<boolean>(!!customThemeIdFromPath);
    const [error, setError] = useState<string>('');
    if (customThemeIdFromPath) {
        // debugger
        // 自定义主题
        /*Bmob.Query('config')
            .get(customThemeIdFromPath)
            .then((res) => {
                // @ts-ignore
                const { content } = res;
                try {
                    const customTheme = JSON.parse(content);
                    setTheme(customTheme);
                    setLoading(false);
                } catch (e) {
                    setError('主题配置解析失败');
                }
            })
            .catch(({ error }) => {
                setError(error);
            });*/
    }

    return loading ? (
        <Loading error={error} />
    ) : (
        <>
            <Game theme={theme} initLevel={initLevel} pureMode={!!theme.pure} />
            <BeiAn />
        </>
    );
};

export default App;
