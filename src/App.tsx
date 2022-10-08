import React, { FC, useEffect, useState, Suspense } from 'react';
import './App.scss';
import {
    domRelatedOptForTheme,
    LAST_LEVEL_STORAGE_KEY,
    LAST_SCORE_STORAGE_KEY,
    wrapThemeDefaultSounds,
} from './utils';
import { Theme } from './themes/interface';
import Game from './components/Game';
import { BeiAn } from './components/BeiAn';
import { Title } from './components/Title';
import { PersonalInfo } from './components/PersonalInfo';
import { Info } from './components/Info';
const ThemeChanger = React.lazy(() => import('./components/ThemeChanger'));
const ConfigDialog = React.lazy(() => import('./components/ConfigDialog'));

// 读取缓存关卡得分
const initLevel = Number(localStorage.getItem(LAST_LEVEL_STORAGE_KEY) || '1');
const initScore = Number(localStorage.getItem(LAST_SCORE_STORAGE_KEY) || '0');

const App: FC<{ theme: Theme<any> }> = ({ theme: initTheme }) => {
    console.log('initTheme', initTheme);
    // console.log(JSON.stringify(theme));

    const [theme, setTheme] = useState<Theme<any>>(initTheme);
    const [diyDialogShow, setDiyDialogShow] = useState<boolean>(false);

    const changeTheme = (theme: Theme<any>) => {
        wrapThemeDefaultSounds(theme);
        domRelatedOptForTheme(theme);
        setTheme({ ...theme });
    };

    const previewTheme = (_theme: Theme<any>) => {
        const theme = JSON.parse(JSON.stringify(_theme));
        wrapThemeDefaultSounds(theme);
        domRelatedOptForTheme(theme);
        setTheme(theme);
    };

    // 生产环境才统计
    useEffect(() => {
        console.log(import.meta.env.MODE);
        if (import.meta.env.PROD) {
            const busuanziScript = document.createElement('script');
            busuanziScript.src =
                '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
            document.getElementById('root')?.appendChild(busuanziScript);
        }
    }, []);

    return (
        <>
            {theme.background && (
                <img
                    alt="background"
                    src={theme.background}
                    className="background"
                    style={{
                        filter: theme.backgroundBlur ? 'blur(8px)' : 'none',
                    }}
                />
            )}
            <Title title={theme.title} desc={theme.desc} />
            <Game
                key={theme.title}
                theme={theme}
                initLevel={initLevel}
                initScore={initScore}
            />
            <PersonalInfo />
            <div className={'flex-spacer'} />
            <p style={{ textAlign: 'center', fontSize: 10, opacity: 0.5 }}>
                <span id="busuanzi_container_site_pv">
                    累计访问：
                    <span id="busuanzi_value_site_pv" />次
                </span>
                <br />
                <BeiAn />
            </p>
            <Suspense fallback={<span>Loading</span>}>
                {!theme.pure && (
                    <>
                        <Info />
                        <ThemeChanger
                            changeTheme={changeTheme}
                            onDiyClick={() => setDiyDialogShow(true)}
                        />
                        {diyDialogShow && (
                            <ConfigDialog
                                closeMethod={() => setDiyDialogShow(false)}
                                previewMethod={previewTheme}
                            />
                        )}
                    </>
                )}
            </Suspense>
        </>
    );
};

export default App;
