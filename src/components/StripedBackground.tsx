import { StyleSheet, useWindowDimensions, View } from 'react-native';

export function StripedBackground() {
  const { height, width } = useWindowDimensions();
  const stripeLength = (height + width) * 1.5;
  const stripeCount = Math.ceil((height + width) / 28) + 4;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container]}>
      {Array.from({ length: stripeCount }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stripe,
            {
              height: stripeLength,
              left: index * 28 - height,
              top: (height - stripeLength) / 2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    transform: [{ rotate: '45deg' }],
  },
});
