import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PokeballIconProps {
  size: number;
  bandColor?: string;
}

// Pokéball dessinée en vues natives : nette à toutes les tailles, sans image à charger
const PokeballIcon: React.FC<PokeballIconProps> = ({ size, bandColor = '#1E293B' }) => {
  const border = Math.max(2, Math.round(size * 0.07));
  const band = Math.max(2, Math.round(size * 0.1));
  const center = Math.round(size * 0.36);
  const inner = Math.round(center * 0.5);

  return (
    <View
      style={[
        styles.ball,
        { width: size, height: size, borderRadius: size / 2, borderWidth: border, borderColor: bandColor },
      ]}
    >
      <View style={styles.top} />
      <View style={styles.bottom} />
      <View style={[styles.band, { height: band, marginTop: -band / 2, backgroundColor: bandColor }]} />
      <View
        style={[
          styles.center,
          {
            width: center,
            height: center,
            borderRadius: center / 2,
            borderWidth: border,
            borderColor: bandColor,
            marginTop: -center / 2,
            marginLeft: -center / 2,
          },
        ]}
      >
        <View style={[styles.inner, { width: inner, height: inner, borderRadius: inner / 2, borderColor: bandColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ball: {
    overflow: 'hidden',
  },
  top: {
    flex: 1,
    backgroundColor: '#DC2626',
  },
  bottom: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  band: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
  },
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default PokeballIcon;
