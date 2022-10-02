import React, { FC } from 'react';
import style from './Loading.module.scss';
import classNames from 'classnames';

export const Loading: FC<{ error: string }> = ({ error }) => {
    return (
        <div className={style.loading}>
            <div className={style.blockContainer}>
                {[1, 2, 3].map((num) => (
                    <div
                        key={num}
                        className={classNames(
                            style.block,
                            style[`block${num}`],
                            error && style.error
                        )}
                    />
                ))}
            </div>
            {error ? (
                <span>
                    {error}，稍后再试或<a href="/">返回首页</a>
                </span>
            ) : (
                <span>加载中...</span>
            )}
        </div>
    );
};
