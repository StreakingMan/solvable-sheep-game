import { Theme } from './themes/interface';
import { getDefaultTheme } from './themes/default';

export const LAST_LEVEL_STORAGE_KEY = 'lastLevel';
export const LAST_SCORE_STORAGE_KEY = 'lastScore';
export const LAST_TIME_STORAGE_KEY = 'lastTime';
export const LAST_UPLOAD_TIME_STORAGE_KEY = 'lastUploadTime';
export const DEFAULT_BGM_STORAGE_KEY = 'defaultBgm';
export const DEFAULT_TRIPLE_SOUND_STORAGE_KEY = 'defaultTripleSound';
export const DEFAULT_CLICK_SOUND_STORAGE_KEY = 'defaultClickSound';

export const randomString: (len: number) => string = (len) => {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    while (len > 0) {
        res += pool[Math.floor(pool.length * Math.random())];
        len--;
    }
    return res;
};

export const waitTimeout: (timeout: number) => Promise<void> = (timeout) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
};

// 从url获取自定义主题Id
export const parsePathCustomThemeId: (url: string) => string = (url) => {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    return params.get('customTheme') || '';
};

// 截图
export const captureElement = (id: string, filename: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const element = document.getElementById(id);
    if (!element) return;
    console.log(element);
    canvas.width = element.clientWidth;
    canvas.height = element.clientHeight;
    console.log(element.clientWidth);
    // @ts-ignore
    ctx.drawImage(element, 0, 0, element.clientWidth, element.clientHeight);
    canvas.toBlob(
        function (blob) {
            if (!blob) return;
            const eleLink = document.createElement('a');
            eleLink.download = filename;
            eleLink.style.display = 'none';
            // 字符内容转变成blob地址
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
        },
        'image/png',
        1
    );
};

export const wrapThemeDefaultSounds: (theme: Theme<any>) => void = (theme) => {
    const defaultTheme = getDefaultTheme();
    // 默认音频资源补充
    if (!theme.bgm) {
        theme.bgm = defaultTheme.bgm;
    }
    let hasUseDefaultTriple, hasUseDefaultClick;
    for (const icon of theme.icons) {
        if (!icon.clickSound) icon.clickSound = 'button-click';
        if (!icon.tripleSound) icon.tripleSound = 'triple';
        if (icon.clickSound === 'button-click') hasUseDefaultClick = true;
        if (icon.tripleSound === 'triple') hasUseDefaultTriple = true;
    }
    if (
        hasUseDefaultClick &&
        !theme.sounds.find((s) => s.name === 'button-click')
    ) {
        const defaultClick = defaultTheme.sounds.find(
            (s) => s.name === 'button-click'
        );
        defaultClick && theme.sounds.push(defaultClick);
    }
    if (hasUseDefaultTriple && !theme.sounds.find((s) => s.name === 'triple')) {
        const defaultTripleSound = defaultTheme.sounds.find(
            (s) => s.name === 'triple'
        );
        defaultTripleSound && theme.sounds.push(defaultTripleSound);
    }

    // 兼容旧数据
    for (const sound of theme.sounds) {
        if (['triple', 'button-click'].includes(sound.name))
            // @ts-ignore
            sound.src = defaultTheme.sounds.find(
                (s) => s.name === sound.name
            ).src;
    }
};

export const domRelatedOptForTheme = (theme: Theme<any>) => {
    document.body.style.backgroundColor = theme.backgroundColor || 'white';
    document.body.style.color = theme.dark ? 'white' : 'rgb(0 0 0 / 60%)';
};
