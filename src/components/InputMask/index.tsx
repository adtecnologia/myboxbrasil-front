import { FC, ReactNode } from 'react';
import InputMask, { Props } from 'react-input-mask';

type TInputMaskCorrect = Omit<Props, 'children'> & { children: any };

export const InputMaskCorrect: FC<TInputMaskCorrect> = ( { children, ...props }) => {
    // const child = children as ReactNode;
    return <InputMask children={children} {...props} />
}