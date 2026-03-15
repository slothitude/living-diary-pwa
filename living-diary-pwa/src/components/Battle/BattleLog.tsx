/**
 * BattleLog Component
 *
 * Descriptive battle text that narrates the action.
 * Shows move effectiveness, critical hits, and battle flow.
 */

import { useEffect, useRef } from 'react';

export interface BattleLogEntry {
  id: number;
  text: string;
  type: 'info' | 'success' | 'damage' | 'miss' | 'critical' | 'healing';
  timestamp: number;
}

interface BattleLogProps {
  entries: BattleLogEntry[];
}

export function BattleLog({ entries }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const getEntryStyle = (type: BattleLogEntry['type']): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '8px 12px',
      marginBottom: '6px',
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: '1.4',
      animation: 'slideIn 0.3s ease-out',
    };

    switch (type) {
      case 'critical':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 154, 162, 0.2))',
          color: '#FF6B9D',
          fontWeight: 'bold',
          borderLeft: '3px solid #FF6B9D',
        };
      case 'success':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(102, 187, 106, 0.15))',
          color: '#4CAF50',
          fontWeight: '600',
          borderLeft: '3px solid #4CAF50',
        };
      case 'damage':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 183, 77, 0.15))',
          color: '#FF9800',
          borderLeft: '3px solid #FF9800',
        };
      case 'miss':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.15), rgba(189, 189, 189, 0.15))',
          color: '#9E9E9E',
          fontStyle: 'italic',
          borderLeft: '3px solid #9E9E9E',
        };
      case 'healing':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(67, 160, 71, 0.2))',
          color: '#81C784',
          fontWeight: '600',
          borderLeft: '3px solid #81C784',
        };
      default: // 'info'
        return {
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.5)',
          color: '#666',
          borderLeft: '3px solid rgba(102, 126, 234, 0.5)',
        };
    }
  };

  if (entries.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState} ref={scrollRef}>
          <p style={styles.emptyText}>Battle starting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.log} ref={scrollRef}>
        {entries.map((entry) => (
          <div key={entry.id} style={getEntryStyle(entry.type)}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '12px',
    maxHeight: '200px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  log: {
    overflowY: 'auto',
    maxHeight: '176px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(102, 126, 234, 0.3) transparent',
  },
  emptyState: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#999',
    fontStyle: 'italic',
    margin: 0,
  },
};

/**
 * Helper to create battle log entries
 */
export function createLogEntry(
  text: string,
  type: BattleLogEntry['type'] = 'info'
): BattleLogEntry {
  return {
    id: Date.now() + Math.random(),
    text,
    type,
    timestamp: Date.now(),
  };
}

/**
 * Formatters for common battle events
 */
export const BattleLogFormatters = {
  usedMove: (creatureName: string, moveName: string): BattleLogEntry =>
    createLogEntry(`${creatureName} used ${moveName}!`, 'info'),

  dealtDamage: (damage: number, effectiveness?: string): BattleLogEntry => {
    if (effectiveness === 'super') {
      return createLogEntry(`Dealt ${damage} damage! It's super effective! 💥`, 'critical');
    } else if (effectiveness === 'weak') {
      return createLogEntry(`Dealt ${damage} damage. Not very effective...`, 'damage');
    }
    return createLogEntry(`Dealt ${damage} damage!`, 'damage');
  },

  missed: (): BattleLogEntry =>
    createLogEntry(`The attack missed!`, 'miss'),

  criticalHit: (damage: number): BattleLogEntry =>
    createLogEntry(`Critical hit! Dealt ${damage} damage! ✨`, 'critical'),

  healed: (amount: number): BattleLogEntry =>
    createLogEntry(`Recovered ${amount} HP! 💚`, 'healing'),

  fainted: (creatureName: string): BattleLogEntry =>
    createLogEntry(`${creatureName} fainted!`, 'miss'),

  won: (): BattleLogEntry =>
    createLogEntry(`🎉 Victory! Your creature triumphs!`, 'success'),

  lost: (): BattleLogEntry =>
    createLogEntry(`Your creature has fallen...`, 'miss'),

  roundStart: (round: number): BattleLogEntry =>
    createLogEntry(`--- Round ${round} ---`, 'info'),
};
