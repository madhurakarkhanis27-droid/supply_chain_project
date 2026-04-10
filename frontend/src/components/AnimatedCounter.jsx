import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  currency = false
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Treat null/undefined as 0
    let startTimestamp = null;
    const numericValue = typeof value === 'number' ? value : 
                         (typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : 0);
    const startValue = 0;

    if (numericValue === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = startValue + easeProgress * (numericValue - startValue);
      
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(numericValue); // Ensure we hit exact target at the end
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  // Format the output
  const formatValue = (val) => {
    if (currency) {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
      return `₹${val.toFixed(0)}`;
    }
    
    // Regular number formatting
    return Number(val.toFixed(decimals)).toLocaleString('en-IN');
  };

  return (
    <span>
      {prefix}
      {formatValue(count)}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
