import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.scss';
import './styles/utils.scss';
import Bmob from 'hydrogen-js-sdk';
import {
    domRelatedOptForTheme,
    parsePathCustomThemeId,
    PLAYING_THEME_ID_STORAGE_KEY,
    resetScoreStorage,
    wrapThemeDefaultSounds,
} from './utils';
import { getDefaultTheme } from './themes/default';
import { Theme } from './themes/interface';

// react渲染
const render = (theme: Theme<any>) => {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <React.StrictMode>
            <App theme={theme} />
        </React.StrictMode>
    );
};

// 错误提示
const errorTip = (tip: string) => {
    setTimeout(() => {
        document.getElementById('loading')?.classList.add('error');
        document.getElementById('loadingText')!.innerText = tip;
        document.getElementById('backHomeTip')!.style.visibility = 'visible';
    }, 600);
};

// 加载成功后数据转换（runtime）以及转场
const successTrans = (theme: Theme<any>) => {
    // 如果上次玩的不是这个主题，清除缓存分数
    const lastPlayTheme = localStorage.getItem(PLAYING_THEME_ID_STORAGE_KEY);
    if (
        !lastPlayTheme ||
        ![customThemeIdFromPath, theme.title].includes(lastPlayTheme)
    ) {
        resetScoreStorage();
    }

    // 缓存当前主题id
    localStorage.setItem(
        PLAYING_THEME_ID_STORAGE_KEY,
        customThemeIdFromPath || theme.title
    );

    wrapThemeDefaultSounds(theme);

    setTimeout(() => {
        domRelatedOptForTheme(theme);
        const root = document.getElementById('root');
        root!.style.opacity = '0';
        document.getElementById('loading')?.classList.add('success');
        setTimeout(() => {
            render(theme);
            root!.style.opacity = '1';
        }, 600);
    }, 500);
};

// 从url初始化主题
const customThemeIdFromPath = parsePathCustomThemeId(location.href);

// Bmob初始化
// @ts-ignore
Bmob.initialize(
    import.meta.env.VITE_BMOB_SECRETKEY,
    import.meta.env.VITE_BMOB_SECCODE
);

// 请求主题
if (customThemeIdFromPath) {
    const storageTheme = localStorage.getItem(customThemeIdFromPath);
    if (storageTheme) {
        try {
            const customTheme = JSON.parse(storageTheme);
            successTrans(customTheme);
        } catch (e) {
            errorTip('主题配置解析失败');
        }
    } else {
        Bmob.Query('config')
            .get(customThemeIdFromPath)
            .then((res) => {
                const { content, increment } = res as any;
                localStorage.setItem(customThemeIdFromPath, content);
                try {
                    const customTheme = JSON.parse(content);
                    successTrans(customTheme);
                } catch (e) {
                    errorTip('主题配置解析失败');
                }
                // 统计访问次数
                increment('visitNum');
                // @ts-ignore
                res.save();
            })
            .catch(({ error }) => {
                errorTip(error);
            });
    }
} else {
    successTrans(getDefaultTheme());
}
