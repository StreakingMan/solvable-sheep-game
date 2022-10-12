import React, { FC } from 'react';
import style from './Fireworks.module.scss';
const Fireworks: FC = () => {
    return (
        <div className={style.pyro}>
            <div className={style.before} />
            <div className={style.after} />
        </div>
    );
};

export default Fireworks;
