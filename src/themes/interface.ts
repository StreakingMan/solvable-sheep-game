import { ReactNode } from 'react';

export interface Icon<T = string> {
    name: string;
    content: ReactNode;
    clickSound: T;
    tripleSound: T;
}

interface Sound<T = string> {
    name: T;
    src: string;
}

type Operation = 'shift' | 'undo' | 'wash';

export interface Theme<SoundNames> {
    title: string;
    desc?: ReactNode;
    name: string;
    bgm?: string;
    icons: Icon<SoundNames>[];
    sounds: Sound<SoundNames>[];
    operateSoundMap?: Record<Operation, SoundNames>;
}
