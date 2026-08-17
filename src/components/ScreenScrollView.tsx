import type { ComponentProps, ReactNode } from 'react';
import { ScrollView } from 'react-native';

type ScreenScrollViewProps = ComponentProps<typeof ScrollView> & {
  children: ReactNode;
};

export function ScreenScrollView({ children, contentContainerStyle, ...props }: ScreenScrollViewProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-5 pb-[124px]"
      contentContainerStyle={contentContainerStyle}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
