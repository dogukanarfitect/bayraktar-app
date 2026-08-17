import type { ComponentProps, ComponentType } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, { className: 'style' });

type NativeLinearGradientProps = ComponentProps<typeof LinearGradient> & {
  className?: string;
};

export const NativeLinearGradient = LinearGradient as ComponentType<NativeLinearGradientProps>;
