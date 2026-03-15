/**
 * DamageNumber Component
 *
 * Floating damage numbers that animate up and fade out.
 * Like Pokemon but gentler - fitting the Living Diary aesthetic.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface DamageNumberProps {
  damage: number;
  isCritical?: boolean;
  isHealing?: boolean;
  x: number;
  y: number;
  color?: string;
  onComplete?: () => void;
}

export function DamageNumber({
  damage,
  isCritical = false,
  isHealing = false,
  x,
  y,
  color,
  onComplete,
}: DamageNumberProps) {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    // Animate floating up and fading out
    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        // Float up (0 to -80px)
        setOffsetY(progress * -80);
        // Fade out after 70% of animation
        setOpacity(progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setVisible(false);
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete]);

  if (!visible) return null;

  // Determine color based on damage type
  const getTextColor = (): string => {
    if (color) return color;
    if (isHealing) return '#4CAF50';
    if (isCritical) return '#FF6B9D';
    return '#FF9800';
  };

  // Get text content
  const getText = (): string => {
    if (isHealing) return `+${damage}`;
    if (isCritical) return `${damage}!`;
    return `${damage}`;
  };

  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    fontSize: isCritical ? '32px' : '24px',
    fontWeight: isCritical ? 'bold' : '600',
    color: getTextColor(),
    opacity,
    transform: `translateY(${offsetY}px)`,
    pointerEvents: 'none',
    userSelect: 'none',
    textShadow: isCritical
      ? '0 0 10px rgba(255, 107, 157, 0.8), 0 2px 4px rgba(0, 0, 0, 0.3)'
      : '0 2px 4px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    transition: 'transform 0.1s ease-out',
  };

  return createPortal(
    <div style={style}>
      {getText()}
      {isCritical && <span style={{ fontSize: '20px' }}> ✨</span>}
    </div>,
    document.body
  );
}

/**
 * Hook to show damage numbers at a target element's position
 */
export function useDamageNumbers() {
  const [numbers, setNumbers] = useState<Array<{
    id: number;
    damage: number;
    isCritical: boolean;
    isHealing: boolean;
    x: number;
    y: number;
    color?: string;
  }>>([]);

  const showDamage = (
    element: HTMLElement | null,
    damage: number,
    options?: {
      isCritical?: boolean;
      isHealing?: boolean;
      color?: string;
    }
  ) => {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - 30; // Center horizontally
    const y = rect.top; // Start at top of element

    const id = Date.now() + Math.random();
    setNumbers(prev => [...prev, {
      id,
      damage,
      isCritical: options?.isCritical || false,
      isHealing: options?.isHealing || false,
      x,
      y,
      color: options?.color,
    }]);
  };

  const removeNumber = (id: number) => {
    setNumbers(prev => prev.filter(n => n.id !== id));
  };

  return {
    damageNumbers: numbers,
    showDamage,
    removeNumber,
  };
}
