import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import style from './ConfigDialog.module.scss';
import classNames from 'classnames';
import { Icon, Sound, Theme } from '../themes/interface';
import { QRCodeCanvas } from 'qrcode.react';
import Bmob from 'hydrogen-js-sdk';
import {
    captureElement,
    CUSTOM_THEME_STORAGE_KEY,
    LAST_UPLOAD_TIME_STORAGE_KEY,
    randomString,
    wrapThemeDefaultSounds,
} from '../utils';
import { copy } from 'clipboard';
import { CloseIcon } from './CloseIcon';
import WxQrCode from './WxQrCode';

const InputContainer: FC<{
    label: string;
    required?: boolean;
    children: ReactNode;
}> = ({ label, children, required }) => {
    return (
        <>
            <div className={style.divider} />
            <div
                className={classNames(
                    'flex-container flex-center flex-no-wrap',
                    style.inputContainer,
                    required && style.required
                )}
            >
                <span className={style.label}>{label}</span>
                <div className={'flex-container flex-column flex-grow'}>
                    {children}
                </div>
            </div>
        </>
    );
};

const ConfigDialog: FC<{
    closeMethod: () => void;
    previewMethod: (theme: Theme<string>) => void;
}> = ({ closeMethod, previewMethod }) => {
    // 错误提示
    const [configError, setConfigError] = useState<string>('');
    // 生成链接
    const [genLink, setGenLink] = useState<string>('');
    const [customTheme, setCustomTheme] = useState<Theme<any>>({
        title: '',
        sounds: [],
        icons: new Array(10).fill(0).map(() => ({
            name: randomString(4),
            content: '',
            clickSound: '',
            tripleSound: '',
        })),
    });

    // 编辑中音效
    const [editSound, setEditSound] = useState<Sound>({ name: '', src: '' });

    // 初始化
    useEffect(() => {
        try {
            const configString = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
            if (configString) {
                const parseRes = JSON.parse(configString);
                if (typeof parseRes === 'object') {
                    setCustomTheme(parseRes);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, []);

    // 生成主题
    const generateTheme: () => Promise<Theme<any>> = async () => {
        // TODO 校验
        const cloneTheme = JSON.parse(JSON.stringify(customTheme));
        wrapThemeDefaultSounds(cloneTheme);
        return Promise.resolve(cloneTheme);
    };

    // 预览
    const onPreviewClick = () => {
        setConfigError('');
        generateTheme()
            .then((theme) => {
                previewMethod(theme);
                localStorage.setItem(
                    CUSTOM_THEME_STORAGE_KEY,
                    JSON.stringify(theme)
                );
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
                localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, stringify);
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

    // TODO HTML有点臭长了，待优化
    // @ts-ignore
    return (
        <div className={classNames(style.dialog)}>
            <div className={style.closeBtn} onClick={closeMethod}>
                <CloseIcon fill={'#fff'} />
            </div>
            <h2>自定义主题</h2>

            <InputContainer label={'标题'} required>
                <input placeholder={'请输入标题'} />
            </InputContainer>
            <InputContainer label={'描述'}>
                <input placeholder={'请输入描述'} />
            </InputContainer>
            <InputContainer label={'BGM'}>
                <input type={'file'} />
                <input placeholder={'或者输入https外链'} />
            </InputContainer>
            <InputContainer label={'背景图'}>
                <input type={'file'} />
                <input placeholder={'或者输入https外链'} />
                <div className={'flex-container flex-center flex-no-wrap'}>
                    <span>毛玻璃</span>
                    <input type={'checkbox'} />
                    <div className={'flex-spacer'} />
                    <span>深色</span>
                    <input type={'checkbox'} />
                    <div className={'flex-spacer'} />
                    <span>纯色</span>
                    <input type={'color'} value="#fff" />
                </div>
                <div className={style.tip}>
                    使用图片或者纯色作为背景，图片可开启毛玻璃效果。如果你使用了深色的图片和颜色，请开启深色模式，此时标题等文字将变为亮色
                </div>
            </InputContainer>
            <InputContainer label={'关卡数'}>
                <input
                    type={'number'}
                    placeholder={'最低5关，最高...理论上无限，默认为50'}
                />
            </InputContainer>
            <InputContainer label={'音效素材'} required>
                <div className={'flex-container flex-left-center'}>
                    {customTheme.sounds.map((sound, idx) => {
                        return (
                            <div key={sound.name} className={style.soundItem}>
                                <audio src={sound.src} controls />
                                <div className={style.inner}>
                                    <span>{sound.name}</span>
                                    <CloseIcon fill={'#fff'} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <input
                    placeholder={'输入音效名称'}
                    onChange={(event) =>
                        setEditSound({
                            name: event.target.value,
                            src: editSound.src,
                        })
                    }
                />
                <input type={'file'} />
                <input
                    placeholder={'或者输入https外链'}
                    onChange={(event) =>
                        setEditSound({
                            src: event.target.value,
                            name: editSound.name,
                        })
                    }
                />
                <button
                    onClick={() =>
                        setCustomTheme({
                            ...customTheme,
                            sounds: [...customTheme.sounds, editSound],
                        })
                    }
                >
                    添加音效
                </button>
            </InputContainer>
            <InputContainer label={'图标素材'} required>
                <div className={'flex-container flex-left-center'}>
                    {customTheme.icons.map((icon, idx) => {
                        return <div key={icon.name}>{icon.name}</div>;
                    })}
                </div>
            </InputContainer>
            <InputContainer label={'操作音效'}>？？</InputContainer>
            <WxQrCode />
        </div>
    );
};

export default ConfigDialog;
