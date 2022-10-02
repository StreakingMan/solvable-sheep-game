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

export const LAST_LEVEL_STORAGE_KEY = 'lastLevel';
