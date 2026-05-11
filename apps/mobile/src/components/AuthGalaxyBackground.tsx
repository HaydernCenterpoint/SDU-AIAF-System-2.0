import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';

const stars = [
  { left: '8%', top: '11%', size: 2, opacity: 0.75 },
  { left: '18%', top: '26%', size: 3, opacity: 0.55 },
  { left: '29%', top: '16%', size: 2, opacity: 0.82 },
  { left: '41%', top: '32%', size: 2, opacity: 0.62 },
  { left: '57%', top: '13%', size: 3, opacity: 0.72 },
  { left: '72%', top: '23%', size: 2, opacity: 0.8 },
  { left: '88%', top: '18%', size: 3, opacity: 0.62 },
  { left: '78%', top: '43%', size: 2, opacity: 0.72 },
  { left: '12%', top: '56%', size: 2, opacity: 0.58 },
  { left: '64%', top: '66%', size: 3, opacity: 0.66 },
  { left: '34%', top: '76%', size: 2, opacity: 0.52 },
  { left: '86%', top: '82%', size: 2, opacity: 0.6 },
] as const;

export function AuthGalaxyBackground() {
  const comet = useRef(new Animated.Value(0)).current;
  const cometTwo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (value: Animated.Value, delay: number, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const first = makeLoop(comet, 900, 1450);
    const second = makeLoop(cometTwo, 4300, 1200);
    first.start();
    second.start();
    return () => {
      first.stop();
      second.stop();
    };
  }, [comet, cometTwo]);

  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.nebulaBlue} />
      <View style={styles.nebulaRed} />
      <View style={styles.galaxyBand} />
      {stars.map((star, index) => (
        <View
          key={`${star.left}-${star.top}-${index}`}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      <Animated.View style={[styles.comet, cometStyle(comet, 0)]}>
        <View style={styles.cometCore} />
      </Animated.View>
      <Animated.View style={[styles.comet, styles.cometSmall, cometStyle(cometTwo, 1)]}>
        <View style={styles.cometCore} />
      </Animated.View>
    </View>
  );
}

function cometStyle(value: Animated.Value, variant: 0 | 1) {
  const translateX = value.interpolate({
    inputRange: [0, 1],
    outputRange: variant === 0 ? [210, -360] : [240, -300],
  });
  const translateY = value.interpolate({
    inputRange: [0, 1],
    outputRange: variant === 0 ? [-60, 170] : [20, 160],
  });
  const opacity = value.interpolate({
    inputRange: [0, 0.08, 0.72, 1],
    outputRange: [0, 0.95, 0.9, 0],
  });

  return {
    opacity,
    transform: [{ translateX }, { translateY }, { rotate: '-18deg' }],
  };
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#061936',
  },
  nebulaBlue: {
    position: 'absolute',
    top: 80,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 160,
    backgroundColor: Colors.blue,
    opacity: 0.26,
  },
  nebulaRed: {
    position: 'absolute',
    right: -100,
    bottom: 120,
    width: 280,
    height: 280,
    borderRadius: 170,
    backgroundColor: Colors.primary,
    opacity: 0.18,
  },
  galaxyBand: {
    position: 'absolute',
    left: -80,
    top: '38%',
    width: '136%',
    height: 150,
    borderRadius: 90,
    backgroundColor: 'rgba(24, 168, 232, 0.18)',
    transform: [{ rotate: '-12deg' }],
  },
  star: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
  },
  comet: {
    position: 'absolute',
    top: '22%',
    right: -150,
    width: 190,
    height: 2,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  cometSmall: {
    top: '35%',
    width: 150,
    opacity: 0.8,
  },
  cometCore: {
    position: 'absolute',
    left: 0,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: Colors.brandGold,
  },
});
