import { StyleSheet, useWindowDimensions, View } from 'react-native';

export function StripedBackground() {
  const { height, width } = useWindowDimensions();
  const canvasSize = Math.ceil(Math.hypot(height, width) * 2);
  const stripeCount = Math.ceil(canvasSize / 28) + 1;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container]}>
      <View
        style={{
          position: 'absolute',
          width: canvasSize,
          height: canvasSize,
          left: (width - canvasSize) / 2,
          top: (height - canvasSize) / 2,
          transform: [{ rotate: '45deg' }],
        }}
      >
        {Array.from({ length: stripeCount }, (_, index) => <View key={index} style={[styles.stripe, { height: canvasSize, left: index * 28 }]} />)}
      </View>
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
  },
});
