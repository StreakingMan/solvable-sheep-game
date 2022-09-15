export const randomString: (len: number) => string = (len) => {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let res = '';
    while (len >= 0) {
        res += pool[Math.floor(pool.length * Math.random())];
        len--;
    }
    return res;
};
