import React, {
    FC,
    MouseEventHandler,
    useEffect,
    useRef,
    useState,
} from 'react';

import './App.scss';
import { BilibiliLink, PersonalInfo } from './components/PersonalInfo';
import {
    parsePathCustomThemeId,
    parsePathThemeName,
    randomString,
    waitTimeout,
} from './utils';
import { defaultTheme } from './themes/default';
import { Icon, Theme } from './themes/interface';
import { fishermanTheme } from './themes/fisherman';
import { jinlunTheme } from './themes/jinlun';
import { ikunTheme } from './themes/ikun';
import { pddTheme } from './themes/pdd';
import { BeiAn } from './components/BeiAn';
import { Info } from './components/Info';
import { owTheme } from './themes/ow';
import { ConfigDialog } from './components/ConfigDialog';
import Bmob from 'hydrogen-js-sdk';

// 内置主题
const builtInThemes: Theme<any>[] = [
    defaultTheme,
    fishermanTheme,
    jinlunTheme,
    ikunTheme,
    pddTheme,
    owTheme,
];

// 最大关卡
const maxLevel = 50;

interface MySymbol {
    id: string;
    status: number; // 0->1->2
    isCover: boolean;
    x: number;
    y: number;
    icon: Icon;
}

type Scene = MySymbol[];

// 8*8网格  4*4->8*8
const makeScene: (level: number, icons: Icon[]) => Scene = (level, icons) => {
    const curLevel = Math.min(maxLevel, level);
    const iconPool = icons.slice(0, 2 * curLevel);
    const offsetPool = [0, 25, -25, 50, -50].slice(0, 1 + curLevel);

    const scene: Scene = [];

    const range = [
        [2, 6],
        [1, 6],
        [1, 7],
        [0, 7],
        [0, 8],
    ][Math.min(4, curLevel - 1)];

    const randomSet = (icon: Icon) => {
        const offset =
            offsetPool[Math.floor(offsetPool.length * Math.random())];
        const row =
            range[0] + Math.floor((range[1] - range[0]) * Math.random());
        const column =
            range[0] + Math.floor((range[1] - range[0]) * Math.random());
        scene.push({
            isCover: false,
            status: 0,
            icon,
            id: randomString(6),
            x: column * 100 + offset,
            y: row * 100 + offset,
        });
    };

    // 大于5级别增加icon池
    let compareLevel = curLevel;
    while (compareLevel > 0) {
        iconPool.push(
            ...iconPool.slice(0, Math.min(10, 2 * (compareLevel - 5)))
        );
        compareLevel -= 5;
    }

    for (const icon of iconPool) {
        for (let i = 0; i < 6; i++) {
            randomSet(icon);
        }
    }

    return scene;
};

// o(n) 时间复杂度的洗牌算法
const fastShuffle: <T = any>(arr: T[]) => T[] = (arr) => {
    const res = arr.slice();
    for (let i = 0; i < res.length; i++) {
        const idx = (Math.random() * res.length) >> 0;
        [res[i], res[idx]] = [res[idx], res[i]];
    }
    return res;
};

// 洗牌
const washScene: (level: number, scene: Scene) => Scene = (level, scene) => {
    const updateScene = fastShuffle(scene);
    const offsetPool = [0, 25, -25, 50, -50].slice(0, 1 + level);
    const range = [
        [2, 6],
        [1, 6],
        [1, 7],
        [0, 7],
        [0, 8],
    ][Math.min(4, level - 1)];

    const randomSet = (symbol: MySymbol) => {
        const offset =
            offsetPool[Math.floor(offsetPool.length * Math.random())];
        const row =
            range[0] + Math.floor((range[1] - range[0]) * Math.random());
        const column =
            range[0] + Math.floor((range[1] - range[0]) * Math.random());
        symbol.x = column * 100 + offset;
        symbol.y = row * 100 + offset;
        symbol.isCover = false;
    };

    for (const symbol of updateScene) {
        if (symbol.status !== 0) continue;
        randomSet(symbol);
    }

    return updateScene;
};

interface SymbolProps extends MySymbol {
    onClick: MouseEventHandler;
}

const Symbol: FC<SymbolProps> = ({ x, y, icon, isCover, status, onClick }) => {
    return (
        <div
            className="symbol"
            style={{
                transform: `translateX(${x}%) translateY(${y}%)`,
                backgroundColor: isCover ? '#999' : 'white',
                opacity: status < 2 ? 1 : 0,
            }}
            onClick={onClick}
        >
            <div
                className="symbol-inner"
                style={{ opacity: isCover ? 0.4 : 1 }}
            >
                {typeof icon.content === 'string' ? (
                    icon.content.startsWith('http') ? (
                        /*图片外链*/
                        <img src={icon.content} alt="" />
                    ) : (
                        /*字符表情*/
                        <i>{icon.content}</i>
                    )
                ) : (
                    /*ReactNode*/
                    icon.content
                )}
            </div>
        </div>
    );
};

// 从url初始化主题
const themeFromPath: string = parsePathThemeName(location.href);
const customThemeIdFromPath = parsePathCustomThemeId(location.href);
const CUSTOM_THEME_FAIL_TIP = '查询配置失败';

const App: FC = () => {
    const [curTheme, setCurTheme] = useState<Theme<any>>(
        customThemeIdFromPath
            ? { title: '', icons: [], sounds: [], name: '' }
            : defaultTheme
    );
    const [themes, setThemes] = useState<Theme<any>[]>(builtInThemes);
    const [pureMode, setPureMode] = useState<boolean>(!!customThemeIdFromPath);

    const [scene, setScene] = useState<Scene>(makeScene(1, curTheme.icons));
    const [level, setLevel] = useState<number>(1);
    const [queue, setQueue] = useState<MySymbol[]>([]);
    const [sortedQueue, setSortedQueue] = useState<
        Record<MySymbol['id'], number>
    >({});
    const [finished, setFinished] = useState<boolean>(false);
    const [tipText, setTipText] = useState<string>('');
    const [animating, setAnimating] = useState<boolean>(false);
    const [configDialogShow, setConfigDialogShow] = useState<boolean>(false);

    // 音效
    const soundRefMap = useRef<Record<string, HTMLAudioElement>>({});

    // 第一次点击时播放bgm
    const bgmRef = useRef<HTMLAudioElement>(null);
    const [bgmOn, setBgmOn] = useState<boolean>(false);
    const [once, setOnce] = useState<boolean>(false);
    useEffect(() => {
        if (!bgmRef.current) return;
        if (bgmOn) {
            bgmRef.current.volume = 0.5;
            bgmRef.current.play().then();
        } else {
            bgmRef.current.pause();
        }
    }, [bgmOn]);

    // 初始化主题
    useEffect(() => {
        if (customThemeIdFromPath) {
            // 自定义主题
            Bmob.Query('config')
                .get(customThemeIdFromPath)
                .then((res) => {
                    // @ts-ignore
                    const { content } = res;
                    try {
                        const customTheme = JSON.parse(content);
                        if (!customTheme.pure) {
                            setPureMode(false);
                            setThemes([...themes, customTheme]);
                        }
                        setCurTheme(customTheme);
                    } catch (e) {
                        console.log(e);
                    }
                })
                .catch((e) => {
                    setCurTheme({ ...curTheme, title: CUSTOM_THEME_FAIL_TIP });
                    console.log(e);
                });
        } else if (themeFromPath) {
            // 内置主题
            setCurTheme(
                themes.find((theme) => theme.name === themeFromPath) ??
                    defaultTheme
            );
        }
    }, []);

    // 主题切换
    useEffect(() => {
        // 初始化时不加载bgm
        if (once) {
            setBgmOn(false);
            setTimeout(() => {
                setBgmOn(true);
            }, 300);
        }
        restart();
        // 更改路径query
        if (customThemeIdFromPath) return;
        history.pushState(
            {},
            curTheme.title,
            `/?theme=${encodeURIComponent(curTheme.name)}`
        );
    }, [curTheme]);

    // 队列区排序
    useEffect(() => {
        const cache: Record<string, MySymbol[]> = {};
        // 加上索引，避免以id字典序来排
        const idx = 0;
        for (const symbol of queue) {
            if (cache[idx + symbol.icon.name]) {
                cache[idx + symbol.icon.name].push(symbol);
            } else {
                cache[idx + symbol.icon.name] = [symbol];
            }
        }
        const temp = [];
        for (const symbols of Object.values(cache)) {
            temp.push(...symbols);
        }
        const updateSortedQueue: typeof sortedQueue = {};
        let x = 50;
        for (const symbol of temp) {
            updateSortedQueue[symbol.id] = x;
            x += 100;
        }
        setSortedQueue(updateSortedQueue);
    }, [queue]);

    // 初始化覆盖状态
    useEffect(() => {
        checkCover(scene);
    }, []);

    // 向后检查覆盖
    const checkCover = (scene: Scene) => {
        const updateScene = scene.slice();
        for (let i = 0; i < updateScene.length; i++) {
            // 当前item对角坐标
            const cur = updateScene[i];
            cur.isCover = false;
            if (cur.status !== 0) continue;
            const { x: x1, y: y1 } = cur;
            const x2 = x1 + 100,
                y2 = y1 + 100;

            for (let j = i + 1; j < updateScene.length; j++) {
                const compare = updateScene[j];
                if (compare.status !== 0) continue;

                // 两区域有交集视为选中
                // 两区域不重叠情况取反即为交集
                const { x, y } = compare;

                if (!(y + 100 <= y1 || y >= y2 || x + 100 <= x1 || x >= x2)) {
                    cur.isCover = true;
                    break;
                }
            }
        }
        setScene(updateScene);
    };

    // 弹出
    const pop = () => {
        if (!queue.length) return;
        const updateQueue = queue.slice();
        const symbol = updateQueue.shift();
        if (!symbol) return;
        const find = scene.find((s) => s.id === symbol.id);
        if (find) {
            setQueue(updateQueue);
            find.status = 0;
            find.x = 100 * Math.floor(8 * Math.random());
            find.y = 700;
            checkCover(scene);
            // 音效
            if (soundRefMap.current?.['sound-shift']) {
                soundRefMap.current['sound-shift'].currentTime = 0;
                soundRefMap.current['sound-shift'].play();
            }
        }
    };

    // 撤销
    const undo = () => {
        if (!queue.length) return;
        const updateQueue = queue.slice();
        const symbol = updateQueue.pop();
        if (!symbol) return;
        const find = scene.find((s) => s.id === symbol.id);
        if (find) {
            setQueue(updateQueue);
            find.status = 0;
            checkCover(scene);
            // 音效
            if (soundRefMap.current?.['sound-undo']) {
                soundRefMap.current['sound-undo'].currentTime = 0;
                soundRefMap.current['sound-undo'].play();
            }
        }
    };

    // 洗牌
    const wash = () => {
        checkCover(washScene(level, scene));
        // 音效
        if (soundRefMap.current?.['sound-wash']) {
            soundRefMap.current['sound-wash'].currentTime = 0;
            soundRefMap.current['sound-wash'].play();
        }
    };

    // 加大难度
    const levelUp = () => {
        if (level >= maxLevel) {
            return;
        }
        setFinished(false);
        setLevel(level + 1);
        setQueue([]);
        checkCover(makeScene(level + 1, curTheme.icons));
    };

    // 重开
    const restart = () => {
        setFinished(false);
        setLevel(1);
        setQueue([]);
        checkCover(makeScene(1, curTheme.icons));
    };

    // 点击item
    const clickSymbol = async (idx: number) => {
        if (finished || animating) return;

        if (!once) {
            setBgmOn(true);
            setOnce(true);
        }

        const updateScene = scene.slice();
        const symbol = updateScene[idx];
        if (symbol.isCover || symbol.status !== 0) return;
        symbol.status = 1;

        // 点击音效
        // 不知道为啥敲可选链会提示错误。。。
        if (
            soundRefMap.current &&
            soundRefMap.current[symbol.icon.clickSound]
        ) {
            soundRefMap.current[symbol.icon.clickSound].currentTime = 0;
            soundRefMap.current[symbol.icon.clickSound].play().then();
        }

        let updateQueue = queue.slice();
        updateQueue.push(symbol);

        setQueue(updateQueue);
        checkCover(updateScene);

        setAnimating(true);
        await waitTimeout(150);

        const filterSame = updateQueue.filter((sb) => sb.icon === symbol.icon);

        // 三连了
        if (filterSame.length === 3) {
            updateQueue = updateQueue.filter((sb) => sb.icon !== symbol.icon);
            for (const sb of filterSame) {
                const find = updateScene.find((i) => i.id === sb.id);
                if (find) {
                    find.status = 2;
                    // 三连音效
                    if (
                        soundRefMap.current &&
                        soundRefMap.current[symbol.icon.tripleSound]
                    ) {
                        soundRefMap.current[
                            symbol.icon.tripleSound
                        ].currentTime = 0;
                        soundRefMap.current[symbol.icon.tripleSound]
                            .play()
                            .then();
                    }
                }
            }
        }

        // 输了
        if (updateQueue.length === 7) {
            setTipText('失败了');
            setFinished(true);
        }

        if (!updateScene.find((s) => s.status !== 2)) {
            // 胜利
            if (level === maxLevel) {
                setTipText('完成挑战');
                setFinished(true);
                return;
            }
            // 升级
            setLevel(level + 1);
            setQueue([]);
            checkCover(makeScene(level + 1, curTheme.icons));
        } else {
            setQueue(updateQueue);
            checkCover(updateScene);
        }

        setAnimating(false);
    };

    // 自定义整活
    const customZhenghuo = (theme: Theme<string>) => {
        setCurTheme(theme);
    };

    return (
        <>
            {curTheme.background && (
                <img
                    alt="background"
                    src={curTheme.background}
                    className="background"
                    style={{
                        filter: curTheme.backgroundBlur ? 'blur(8px)' : 'none',
                    }}
                />
            )}
            <h2>
                {curTheme.title}{' '}
                {curTheme.title === CUSTOM_THEME_FAIL_TIP && (
                    <a href="/">返回首页</a>
                )}
            </h2>

            {curTheme.desc}

            {!pureMode && <PersonalInfo />}
            <h3 className="flex-container flex-center">
                {!pureMode && (
                    <>
                        主题:
                        {/*TODO themes维护方式调整*/}
                        <select
                            value={themes.findIndex(
                                (theme) => theme.name === curTheme.name
                            )}
                            onChange={(e) =>
                                setCurTheme(themes[Number(e.target.value)])
                            }
                        >
                            {themes.map((t, idx) => (
                                <option key={t.name} value={idx}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                Level: {level}
            </h3>

            <div className="app">
                <div className="scene-container">
                    <div className="scene-inner">
                        {scene.map((item, idx) => (
                            <Symbol
                                key={item.id}
                                {...item}
                                x={
                                    item.status === 0
                                        ? item.x
                                        : item.status === 1
                                        ? sortedQueue[item.id]
                                        : -1000
                                }
                                y={item.status === 0 ? item.y : 895}
                                onClick={() => clickSymbol(idx)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="queue-container flex-container flex-center" />
            <div className="flex-container flex-between">
                <button className="flex-grow" onClick={pop}>
                    弹出
                </button>
                <button className="flex-grow" onClick={undo}>
                    撤销
                </button>
                <button className="flex-grow" onClick={wash}>
                    洗牌
                </button>
                <button className="flex-grow" onClick={levelUp}>
                    下一关
                </button>
            </div>

            {!pureMode && (
                <button
                    onClick={() => setConfigDialogShow(true)}
                    className="zhenghuo-button primary"
                >
                    我要整活
                </button>
            )}

            <Info style={{ display: pureMode ? 'none' : 'block' }} />

            <BeiAn />

            {pureMode && <BilibiliLink />}

            {/*提示弹窗*/}
            {finished && (
                <div className="modal">
                    <h1>{tipText}</h1>
                    <button onClick={restart}>再来一次</button>
                </div>
            )}

            {/*自定义主题弹窗*/}
            <ConfigDialog
                show={configDialogShow}
                closeMethod={() => setConfigDialogShow(false)}
                previewMethod={customZhenghuo}
            />

            {/*bgm*/}
            <button className="bgm-button" onClick={() => setBgmOn(!bgmOn)}>
                {bgmOn ? '🔊' : '🔈'}
                <audio
                    ref={bgmRef}
                    loop
                    src={curTheme?.bgm || '/sound-disco.mp3'}
                />
            </button>

            {/*音效*/}
            {curTheme.sounds.map((sound) => (
                <audio
                    key={sound.name}
                    ref={(ref) => {
                        if (ref) soundRefMap.current[sound.name] = ref;
                    }}
                    src={sound.src}
                />
            ))}
        </>
    );
};

export default App;
