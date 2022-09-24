import { Theme } from './themes/interface';

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

// 从url获取内置主题name
export const parsePathThemeName: (url: string) => string = (url) => {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    return decodeURIComponent(params.get('theme') || '默认');
};

// 从url解析自定义主题JSON
export const parsePathCustomThemeId: (url: string) => string = (url) => {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    return params.get('customTheme') || '';
};
