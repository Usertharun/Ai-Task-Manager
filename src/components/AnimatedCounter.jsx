import React, { useEffect, useState } from 'react';

export const AnimatedCounter = ({ value, duration = 500 }) => {
  const [count, setCount] = useState(value);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = count;
    const distance = value - startValue;

    if (distance === 0) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + distance * ease));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className="animated-counter">{count}</span>;
};
