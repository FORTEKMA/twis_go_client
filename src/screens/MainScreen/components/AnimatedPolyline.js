import React, { useEffect, useRef, useState } from 'react';
import { Polyline } from 'react-native-maps';

const getDistance = (p1, p2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(p2.latitude - p1.latitude);
  const dLon = toRad(p2.longitude - p1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.latitude)) *
      Math.cos(toRad(p2.latitude)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const AnimatedPolyline = ({ coords = [], speed = 100 }) => {
  const [animatedSegment, setAnimatedSegment] = useState([]);
  const progressIndex = useRef(0);
  const direction = useRef(1);
  const timeoutRef = useRef(null);

  const animate = () => {
    const segmentLength = Math.floor(coords.length * 0.3);
    const maxIndex = coords.length - segmentLength;

    if (segmentLength < 2) return;

    let newIndex = progressIndex.current + direction.current;

    if (newIndex >= maxIndex || newIndex <= 0) {
      direction.current *= -1;
      newIndex = progressIndex.current + direction.current;
    }

    progressIndex.current = newIndex;
    const segment = coords.slice(newIndex, newIndex + segmentLength);
    setAnimatedSegment(segment);

    const dist = getDistance(
      coords[newIndex],
      coords[newIndex + 1] || coords[newIndex]
    );
    const duration = Math.max(80, dist * speed);

    timeoutRef.current = setTimeout(animate, duration);
  };

  useEffect(() => {
    if (coords.length > 2) {
      progressIndex.current = 0;
      direction.current = 1;
      animate();
    }

    return () => clearTimeout(timeoutRef.current);
  }, [coords]);

  return animatedSegment.length > 1 ? (
    <Polyline
      coordinates={animatedSegment}
      strokeWidth={5}
      strokeColor="#000"
      lineCap="round"
      lineJoin="round"
      style={{ zIndex: 1000 }}
    />
  ) : null;
};

export default AnimatedPolyline;
