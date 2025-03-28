import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

interface ConfettiProps {
  isVisible: boolean;
}

interface ConfettiParticle {
  animation: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
  rotate: Animated.Value;
  color: string;
}

const colors = ['#E32636', '#FFD700', '#4169E1', '#32CD32', '#FF69B4'];
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Confetti({ isVisible }: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (isVisible) {
      const newParticles: ConfettiParticle[] = [];
      const particleCount = 250;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          animation: new Animated.Value(0),
          translateX: new Animated.Value(0),
          translateY: new Animated.Value(0),
          rotate: new Animated.Value(0),
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setParticles(newParticles);

      newParticles.forEach((particle, index) => {
        const angle = (Math.random() * 360) * (Math.PI / 180); // Convert to radians
        const speed = Math.random() * screenWidth * 0.5; // Vary the spread distance
        const randomX = Math.cos(angle) * speed;
        const randomY = Math.sin(angle) * speed;
        const randomRotate = Math.random() * 720 - 360; // Rotate between -360 and 360 degrees

        Animated.parallel([
          Animated.timing(particle.animation, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(particle.translateX, {
            toValue: randomX,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(particle.translateY, {
            toValue: randomY,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(particle.rotate, {
            toValue: randomRotate,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ]).start();
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              opacity: particle.animation,
              transform: [
                { translateX: particle.translateX },
                { translateY: particle.translateY },
                { rotate: particle.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -20,
  },
});