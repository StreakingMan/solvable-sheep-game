import React, { FC, useEffect, useRef, useState } from 'react';
import style from './ConfigDialog.module.scss';
import classNames from 'classnames';
import { Icon, Sound, Theme } from '../themes/interface';
import { QRCodeCanvas } from 'qrcode.react';
import Bmob from 'hydrogen-js-sdk';
import { captureElement, LAST_UPLOAD_TIME_STORAGE_KEY } from '../utils';
import { copy } from 'clipboard';

const STORAGEKEY = 'customTheme';
let storageTheme: Theme<any>;
try {
    const configString = localStorage.getItem(STORAGEKEY);
    if (configString) {
        const parseRes = JSON.parse(configString);
        if (typeof parseRes === 'object') storageTheme = parseRes;
    }
} catch (e) {
    //
}

export const ConfigDialog: FC<{
    show: boolean;
    closeMethod: () => void;
    previewMethod: (theme: Theme<string>) => void;
}> = ({ show, closeMethod, previewMethod }) => {
    const [sounds, setSounds] = useState<Sound[]>([]);
    const [icons, setIcons] = useState<Icon[]>([]);
    const inputRefMap = useRef<
        Record<
            'name' | 'link' | 'clickSound' | 'tripleSound' | string,
            HTMLInputElement | HTMLSelectElement
        >
    >({});
    const [configError, setConfigError] = useState<string>('');
    const [customThemeInfo, setCustomThemeInfo] = useState<{
        title: string;
        desc?: string;
        bgm?: string;
        background?: string;
        backgroundBlur?: boolean;
    }>({ title: '', desc: '', bgm: '', background: '', backgroundBlur: false });
    const [addDialog, setAddDialog] = useState<{
        show: boolean;
        type: 'sound' | 'icon';
        iconForm?: Icon;
        soundForm?: Sound;
        error: string;
        idx?: number;
    }>({
        show: false,
        type: 'sound',
        error: '',
    });
    const [genLink, setGenLink] = useState<string>('');
    const [pureCount, setPureCount] = useState<number>(0);

    // 初始化
    useEffect(() => {
        if (storageTheme) {
            const {
                title,
                desc = '',
                bgm = '',
                sounds,
                icons,
                background = '',
                backgroundBlur = false,
            } = storageTheme;
            setSounds(
                sounds.filter(
                    (s) => !['triple', 'button-click'].includes(s.name)
                )
            );
            setIcons(
                icons.map((icon) => {
                    if (icon.clickSound === 'button-click')
                        icon.clickSound = '';
                    if (icon.tripleSound === 'triple') icon.tripleSound = '';
                    return icon;
                })
            );
            setCustomThemeInfo({
                title,
                // @ts-ignore
                desc,
                bgm,
                background,
                backgroundBlur,
            });
        }
    }, []);

    // 音效保存
    const saveSound = (sound: Sound, idx?: number) => {
        if (!sound.src.startsWith('https')) return '请输入https链接';
        const newSounds = sounds.slice();
        const newIcons = icons.slice();
        if (idx != null) {
            // 编辑
            for (let i = 0; i < sounds.length; i++) {
                if (sounds[i].name === sound.name && i !== idx) {
                    return '名称已存在';
                }
            }
            // 检查编辑的音效是否有引用并修改
            const oldSoundName = sounds[idx].name;
            for (const icon of newIcons) {
                if (icon.clickSound === oldSoundName)
                    icon.clickSound = sound.name;
                if (icon.tripleSound === oldSoundName)
                    icon.tripleSound = sound.name;
            }
            newSounds[idx] = sound;
        } else {
            // 新增
            if (sounds.find((s) => s.name === sound.name)) return '名称已存在';
            newSounds.push(sound);
        }
        setIcons(newIcons);
        setSounds(newSounds);
    };
    const onSoundClick = (idx?: number) => {
        if (addDialog.show) return;
        setAddDialog({
            idx,
            show: true,
            type: 'sound',
            soundForm: {
                name: '',
                src: '',
            },
            error: '',
        });
    };

    // 图片保存
    const saveIcon = (icon: Icon, idx?: number) => {
        if (
            typeof icon.content !== 'string' ||
            !icon.content?.startsWith('https')
        )
            return '请输入https链接';
        const newIcons = icons.slice();
        if (idx != null) {
            // 编辑
            for (let i = 0; i < icons.length; i++) {
                if (icons[i].name === icon.name && i !== idx) {
                    return '名称已存在';
                }
            }
            newIcons[idx] = icon;
        } else {
            // 新增
            if (icons.find((i) => i.name === icon.name)) return '名称已存在';
            newIcons.push(icon);
        }
        setIcons(newIcons);
    };
    const onIconClick = (idx?: number) => {
        if (addDialog.show) return;
        setAddDialog({
            idx,
            show: true,
            type: 'icon',
            iconForm:
                idx != null
                    ? { ...icons[idx] }
                    : {
                          name: '',
                          content: '',
                          tripleSound: '',
                          clickSound: '',
                      },
            error: '',
        });
    };

    // 回显
    useEffect(() => {
        const { show, type, idx } = addDialog;
        if (show) return;
        if (!inputRefMap.current) return;
        if (type === 'icon') {
            inputRefMap.current.name.value = idx != null ? icons[idx].name : '';
            inputRefMap.current.link.value =
                idx != null ? (icons[idx].content as string) : '';
            inputRefMap.current.clickSound.value =
                idx != null ? icons[idx]?.clickSound || '' : '';
            inputRefMap.current.tripleSound.value =
                idx != null ? icons[idx]?.tripleSound || '' : '';
        } else {
            inputRefMap.current.name.value =
                idx != null ? sounds[idx].name : '';
            inputRefMap.current.link.value = idx != null ? sounds[idx].src : '';
        }
    }, [addDialog]);

    // 添加单项的点击
    const onAddDialogSaveClick = () => {
        const error = (addDialog.type === 'sound' ? saveSound : saveIcon)(
            addDialog[`${addDialog.type}Form`] as any,
            addDialog.idx
        );
        if (error) {
            setAddDialog({ ...addDialog, error });
        } else {
            closeAddDialog();
        }
    };

    // 关闭添加弹窗
    const closeAddDialog = () => {
        setAddDialog({ ...addDialog, show: false });
    };

    // 生成主题
    const generateTheme: () => Promise<Theme<any>> = async () => {
        const { title, desc, bgm, background, backgroundBlur } =
            customThemeInfo;
        if (bgm && !bgm.startsWith('https'))
            return Promise.reject('背景音乐请输入https链接');
        if (background && !background.startsWith('https'))
            return Promise.reject('背景图片请输入https链接');
        if (!title) return Promise.reject('请填写标题');
        if (icons.length !== 10) return Promise.reject('图片素材需要提供10张');

        const customTheme: Theme<any> = {
            // 恭喜你发现纯净模式彩蛋🎉，点击文字十次可以开启纯净模式
            pure: pureCount !== 0 && pureCount % 10 === 0,
            title,
            desc,
            bgm,
            background,
            backgroundBlur,
            icons,
            sounds,
        };

        console.log(customTheme);

        return Promise.resolve(JSON.parse(JSON.stringify(customTheme)));
    };

    // 预览
    const onPreviewClick = () => {
        setConfigError('');
        generateTheme()
            .then((theme) => {
                previewMethod(theme);
                localStorage.setItem(STORAGEKEY, JSON.stringify(theme));
                closeMethod();
            })
            .catch((e) => {
                setConfigError(e);
            });
    };

    const [uploading, setUploading] = useState<boolean>(false);
    // 生成二维码和链接
    const onGenQrLinkClick = () => {
        if (uploading) return;
        setUploading(true);
        setConfigError('');
        generateTheme()
            .then((theme) => {
                // 五分钟能只能上传一次
                const lastUploadTime = localStorage.getItem(
                    LAST_UPLOAD_TIME_STORAGE_KEY
                );
                if (
                    lastUploadTime &&
                    new Date().getTime() - Number(lastUploadTime) <
                        1000 * 60 * 5
                ) {
                    setConfigError(
                        '五分钟内只能上传一次（用的人有点多十分抱歉😭），先保存预览看看效果把~'
                    );
                    setUploading(false);
                    return;
                }

                const stringify = JSON.stringify(theme);
                localStorage.setItem(STORAGEKEY, stringify);
                const query = Bmob.Query('config');
                query.set('content', stringify);
                query
                    .save()
                    .then((res) => {
                        //@ts-ignore
                        const link = `${location.origin}?customTheme=${res.objectId}`;
                        setGenLink(link);
                        localStorage.setItem(
                            LAST_UPLOAD_TIME_STORAGE_KEY,
                            new Date().getTime().toString()
                        );
                    })
                    .catch(({ error }) => {
                        setConfigError(error);
                        setGenLink('');
                    })
                    .finally(() => {
                        setUploading(false);
                    });
            })
            .catch((e) => {
                setConfigError(e);
                setGenLink('');
                setUploading(false);
            });
    };

    // 删除按钮
    const DeleteBtn: FC<{ idx: number; type: 'sound' | 'icon' }> = ({
        idx,
        type,
    }) => {
        const deleteItem = () => {
            if (type === 'sound') {
                const newSounds = sounds.slice();
                newSounds.splice(idx, 1);
                setSounds(newSounds);
            } else {
                const newIcons = icons.slice();
                newIcons.splice(idx, 1);
                setIcons(newIcons);
            }
        };
        return (
            <div className={style.deleteBtn} onClick={deleteItem}>
                <span>+</span>
            </div>
        );
    };

    // TODO HTML有点臭长了，待优化
    // @ts-ignore
    return (
        <div
            className={classNames(
                style.dialog,
                style.dialogWrapper,
                show && style.dialogShow,
                'flex-container flex-container'
            )}
        >
            <p onClick={() => setPureCount(pureCount + 1)}>
                目前自定义仅支持配置https链接，可网上自行搜索素材复制链接，或者将自己处理好的素材上传第三方存储服务/图床上再复制外链
                （想白嫖的话自行搜索【免费图床】【免费对象存储】【免费mp3外链】等）。
                {pureCount != 0 &&
                    pureCount % 10 === 0 &&
                    '🎉🎉🎉恭喜发现彩蛋！主题分享后将开启纯净模式～'}
            </p>
            <div className="flex-container flex-no-wrap">
                <img
                    style={{ width: 120, objectFit: 'contain' }}
                    src="/wxqrcode.png"
                    alt=""
                />
                <p style={{ margin: 0 }}>
                    <strong>
                        开发不易，如果您喜欢这个项目的话可酌情扫左侧二维码
                        请我喝杯咖啡（后台相关费用用爱发电中，感谢支持）
                    </strong>
                </p>
            </div>

            {/*基本配置*/}
            <h4 className="flex-container flex-center">
                标题：
                <input
                    value={customThemeInfo.title}
                    placeholder="必填"
                    className="flex-grow"
                    onChange={(e) =>
                        setCustomThemeInfo({
                            ...customThemeInfo,
                            title: e.target.value,
                        })
                    }
                />
            </h4>
            <h4 className="flex-container flex-center">
                描述：
                <input
                    value={customThemeInfo.desc}
                    placeholder="可选"
                    className="flex-grow"
                    onChange={(e) =>
                        setCustomThemeInfo({
                            ...customThemeInfo,
                            desc: e.target.value,
                        })
                    }
                />
            </h4>
            <h4 className="flex-container flex-center">
                背景音乐：
                <input
                    value={customThemeInfo.bgm}
                    placeholder="可选 https://example.com/src.audio"
                    className="flex-grow"
                    onChange={(e) =>
                        setCustomThemeInfo({
                            ...customThemeInfo,
                            bgm: e.target.value,
                        })
                    }
                />
            </h4>
            <h4 className="flex-container flex-center">
                背景图片：
                <input
                    value={customThemeInfo.background}
                    placeholder="可选 https://example.com/src.image"
                    className="flex-grow"
                    onChange={(e) =>
                        setCustomThemeInfo({
                            ...customThemeInfo,
                            background: e.target.value,
                        })
                    }
                />
                {customThemeInfo?.background?.startsWith('https') && (
                    <>
                        毛玻璃：
                        <input
                            checked={customThemeInfo.backgroundBlur}
                            onChange={(e) =>
                                setCustomThemeInfo({
                                    ...customThemeInfo,
                                    backgroundBlur: e.target.checked,
                                })
                            }
                            type="checkbox"
                        />
                    </>
                )}
            </h4>

            <h4>音效素材</h4>
            <div className="flex-container">
                {sounds.map((sound, idx) => (
                    <div
                        className="flex-container flex-column"
                        key={sound.name}
                    >
                        <div
                            onClick={() => onSoundClick(idx)}
                            className={classNames(style.addBtn)}
                        >
                            {sound.name}
                        </div>
                        <DeleteBtn idx={idx} type={'sound'} />
                    </div>
                ))}
                {sounds.length < 20 && (
                    <div
                        onClick={() => onSoundClick()}
                        className={classNames(style.addBtn, style.addBtnEmpty)}
                    />
                )}
            </div>
            <h4>图片素材 {icons.length}/10 </h4>
            <div className="flex-container">
                {icons.map((icon, idx) => (
                    <div className="flex-container flex-column" key={icon.name}>
                        <div
                            onClick={() => onIconClick(idx)}
                            className={classNames(style.addBtn)}
                        >
                            {/* @ts-ignore*/}
                            <img src={icon.content} alt="" />
                        </div>
                        <DeleteBtn idx={idx} type={'icon'} />
                    </div>
                ))}
                {icons.length < 10 && (
                    <div
                        onClick={() => onIconClick()}
                        className={classNames(style.addBtn, style.addBtnEmpty)}
                    />
                )}
            </div>

            <div className="flex-spacer" />
            {genLink && (
                <div className="flex-container flex-column">
                    <QRCodeCanvas id="qrCode" value={genLink} size={300} />
                    <button
                        onClick={() =>
                            captureElement('qrCode', customThemeInfo.title)
                        }
                        className="primary"
                    >
                        下载二维码
                    </button>
                    <div>{genLink}</div>
                    <button onClick={() => copy(genLink)} className="primary">
                        复制链接
                    </button>
                </div>
            )}
            {configError && <div className={style.error}>{configError}</div>}
            <div className="flex-container">
                <button className="flex-grow" onClick={onPreviewClick}>
                    保存并预览
                </button>
                <button className="flex-grow" onClick={onGenQrLinkClick}>
                    生成二维码&链接{uploading && '...'}
                </button>
                <button className="flex-grow" onClick={closeMethod}>
                    关闭
                </button>
            </div>

            {/*添加弹窗*/}
            <div
                className={classNames(
                    style.addDialog,
                    addDialog.show && style.addDialogShow,
                    'flex-container flex-column'
                )}
            >
                <div className="flex-container flex-center">
                    名称：
                    <input
                        ref={(ref) => ref && (inputRefMap.current.name = ref)}
                        className="flex-grow"
                        placeholder="唯一名称"
                        onChange={(e) =>
                            setAddDialog({
                                ...addDialog,
                                [`${addDialog.type}Form`]: {
                                    ...addDialog[`${addDialog.type}Form`],
                                    name: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                <div className="flex-container flex-center">
                    链接：
                    <input
                        ref={(ref) => ref && (inputRefMap.current.link = ref)}
                        className="flex-grow"
                        placeholder="https://example.com/src.audioOrImage"
                        onChange={(e) =>
                            setAddDialog({
                                ...addDialog,
                                [`${addDialog.type}Form`]: {
                                    ...addDialog[`${addDialog.type}Form`],
                                    [addDialog.type === 'sound'
                                        ? 'src'
                                        : 'content']: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                {addDialog.type === 'icon' && (
                    <>
                        <div className="flex-container flex-center">
                            点击音效：
                            <select
                                ref={(ref) =>
                                    ref &&
                                    (inputRefMap.current.clickSound = ref)
                                }
                                className="flex-grow"
                                onChange={(e) =>
                                    setAddDialog({
                                        ...addDialog,
                                        /*@ts-ignore*/
                                        iconForm: {
                                            ...addDialog.iconForm,
                                            clickSound: e.target.value,
                                        },
                                    })
                                }
                            >
                                <option value="">默认</option>
                                {sounds.map((s) => (
                                    <option key={s.name} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-container flex-center">
                            三连音效：
                            <select
                                ref={(ref) =>
                                    ref &&
                                    (inputRefMap.current.tripleSound = ref)
                                }
                                className="flex-grow"
                                onChange={(e) =>
                                    setAddDialog({
                                        ...addDialog,
                                        /*@ts-ignore*/
                                        iconForm: {
                                            ...addDialog.iconForm,
                                            tripleSound: e.target.value,
                                        },
                                    })
                                }
                            >
                                <option value="">默认</option>
                                {sounds.map((s) => (
                                    <option key={s.name} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                {addDialog.error && (
                    <div className={style.error}>{addDialog.error}</div>
                )}
                <div className="flex-container">
                    <button className="flex-grow" onClick={closeAddDialog}>
                        取消
                    </button>
                    <button
                        className="flex-grow primary"
                        onClick={onAddDialogSaveClick}
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};
