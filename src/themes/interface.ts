import { ReactNode } from 'react';

export interface Icon<T = string> {
    name: string;
    content: ReactNode;
    clickSound: T;
    tripleSound: T;
}

export interface Sound<T = string> {
    name: T;
    src: string;
}

type Operation = 'shift' | 'undo' | 'wash';

// TODO title name 冗余
export interface Theme<SoundNames> {
    title: string;
    desc?: ReactNode;
    name: string;
    bgm?: string;
    background?: string;
    backgroundBlur?: boolean;
    pure?: boolean;
    icons: Icon<SoundNames>[];
    sounds: Sound<SoundNames>[];
    operateSoundMap?: Record<Operation, SoundNames>;
}
