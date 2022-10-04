import React, { FC } from 'react';
import style from './Title.module.scss';

export const Title: FC<{ title: string; desc?: string }> = ({
    title,
    desc,
}) => {
    return (
        <>
            <h1 className={style.title}>
                {[...title].map((str, i) => (
                    <span
                        className={style.item}
                        style={{ animationDelay: i / 10 + 's' }}
                        key={`${i}`}
                    >
                        {str}
                    </span>
                ))}
            </h1>
            {desc && <h2 className={style.description}>{desc}</h2>}
        </>
    );
};
