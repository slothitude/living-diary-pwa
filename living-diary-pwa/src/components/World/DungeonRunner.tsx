/**
 * Dungeon Runner Component
 *
 * Room-by-room dungeon crawler.
 * Fight, Sneak, or Flee options for each encounter.
 */

import { useState, useEffect } from 'react';
import { useCreatureStore } from '../../stores';
import {
  startDungeonRun,
  getRoomEnemy,
  completeRoom,
  collectRoomLoot,
  completeDungeonRun,
  attemptSneak,
  attemptFlee,
  calculateDungeonScore,
  type DungeonRun,
} from '../../services/dungeonService';
import { type Enemy } from '../../services/enemyService';
import { BattleArena, type BattleResult } from '../Battle/BattleArena';
import type { DungeonRoom } from '../../services/storage';

interface DungeonRunnerProps {
  biomeId: string;
  zoneIndex: number;
  onClose?: () => void;
  onExit?: () => void;
}

type Screen = 'start' | 'room' | 'battle' | 'summary' | 'complete';

export function DungeonRunner({ biomeId, zoneIndex, onClose, onExit }: DungeonRunnerProps) {
  const { creature } = useCreatureStore();
  const [screen, setScreen] = useState<Screen>('start');
  const [dungeonRun, setDungeonRun] = useState<DungeonRun | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [finalScore, setFinalScore] = useState(0);

  const currentRoom = dungeonRun?.rooms[dungeonRun.currentRoom];

  // Start dungeon run
  async function handleStart() {
    if (!creature) return;

    setLoading(true);
    try {
      const run = await startDungeonRun(biomeId, zoneIndex, creature.level || 1);
      setDungeonRun(run);
      await loadRoomEnemy(run);
      setScreen('room');
    } catch (error) {
      console.error('Failed to start dungeon:', error);
      setMessage('Failed to enter dungeon. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Load enemy for current room
  async function loadRoomEnemy(run: DungeonRun) {
    const room = run.rooms[run.currentRoom];
    if (!creature || !room) return;

    setLoading(true);
    try {
      const enemy = await getRoomEnemy(biomeId, room.roomType, creature.level || 1);
      setCurrentEnemy(enemy);
    } catch (error) {
      console.error('Failed to load enemy:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fight option
  function handleFight() {
    setScreen('battle');
  }

  // Sneak option
  function handleSneak() {
    if (!creature || !currentEnemy || !dungeonRun) return;

    const stats = creature.stats || { attack: 10, defense: 10, speed: 10 };
    const success = attemptSneak(
      stats.speed,
      currentEnemy.stats.speed
    );

    if (success) {
      setMessage('You slipped past undetected! 🤫');
      handleRoomComplete(false);
    } else {
      setMessage('They spotted you! Time to fight! ⚔️');
      setScreen('battle');
    }
  }

  // Flee option
  function handleFlee() {
    attemptFlee();
    setMessage('You fled safely! (No loot rewards)');
    setTimeout(() => {
      onExit?.();
    }, 1500);
  }

  // Handle battle result
  function handleBattleEnd(result: BattleResult) {
    setBattleResult(result);

    if (result.won) {
      setMessage('Victory! 💪');
      handleRoomComplete(true);
    } else {
      setMessage('You were defeated... 💀');
      setTimeout(() => {
        if (dungeonRun) {
          setFinalScore(calculateDungeonScore(
            dungeonRun.currentRoom,
            dungeonRun.rooms.length,
            1,
            false
          ));
        }
        setScreen('complete');
      }, 1500);
    }
  }

  // Wrapper to pass won boolean to BattleArena
  function handleBattleWon(won: boolean) {
    const result: BattleResult = {
      won,
      damageDealt: 0,
      damageTaken: 0,
      rounds: 1,
    };
    handleBattleEnd(result);
  }

  // Room completed
  async function handleRoomComplete(fought: boolean) {
    if (!dungeonRun || !currentEnemy) return;

    const creaturesFought = fought ? 1 : 0;

    await completeRoom(
      dungeonRun.dungeonId,
      dungeonRun.currentRoom,
      currentEnemy.id
    );

    // Check if dungeon complete
    if (dungeonRun.currentRoom >= dungeonRun.rooms.length - 1) {
      const score = calculateDungeonScore(
        dungeonRun.rooms.length,
        dungeonRun.rooms.length,
        creaturesFought,
        true
      );
      await completeDungeonRun(dungeonRun.dungeonId, score);
      setFinalScore(score);
      setScreen('complete');
    } else {
      // Move to next room
      setScreen('summary');
    }
  }

  // Continue to next room
  async function handleContinue() {
    if (!dungeonRun) return;

    const nextRoom = dungeonRun.currentRoom + 1;
    setDungeonRun({ ...dungeonRun, currentRoom: nextRoom });

    await loadRoomEnemy({ ...dungeonRun, currentRoom: nextRoom });
    setMessage('');
    setScreen('room');
  }

  // Render start screen
  if (screen === 'start') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={onClose} style={styles.backButton}>← Exit</button>
          <h2 style={styles.title}>🏰 Dungeon</h2>
        </div>

        <div style={styles.content}>
          <div style={styles.card}>
            <p style={styles.text}>
              Enter the dungeon and face 5 rooms of challenges!
            </p>
            <p style={styles.text}>
              The final room holds a powerful boss...
            </p>
            <ul style={styles.list}>
              <li>⚔️ <strong>Fight:</strong> Defeat enemies for full rewards</li>
              <li>🤫 <strong>Sneak:</strong> Avoid combat (Speed check)</li>
              <li>🏃 <strong>Flee:</strong> Leave dungeon safely (no rewards)</li>
            </ul>

            <button
              onClick={handleStart}
              disabled={loading || !creature}
              style={{
                ...styles.button,
                opacity: (loading || !creature) ? 0.5 : 1,
              }}
            >
              {loading ? 'Entering...' : 'Enter Dungeon'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render battle screen
  if (screen === 'battle' && currentEnemy) {
    return (
      <BattleArena
        opponentId={currentEnemy.id}
        opponentName={currentEnemy.name}
        opponentType={currentEnemy.name.toLowerCase().replace(/\s+/g, '-')}
        opponentImage={currentEnemy.imageUrl}
        auto={true}
        onBattleEnd={handleBattleWon}
        onBack={() => setScreen('room')}
      />
    );
  }

  // Render room screen
  if (screen === 'room' && currentRoom && currentEnemy) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={onExit} style={styles.backButton}>← Exit</button>
          <h2 style={styles.title}>
            Room {dungeonRun!.currentRoom + 1}/{dungeonRun.rooms.length}
          </h2>
        </div>

        {currentRoom.imageUrl && (
          <img
            src={currentRoom.imageUrl}
            alt={`Room ${dungeonRun!.currentRoom + 1}`}
            style={styles.roomImage}
          />
        )}

        <div style={styles.content}>
          <div style={styles.enemyCard}>
            <h3 style={styles.enemyName}>{currentEnemy.name}</h3>
            <p style={styles.enemyInfo}>Level {currentEnemy.level} • {currentEnemy.element}</p>
            <div style={styles.stats}>
              <span>❤️ HP: {currentEnemy.stats.maxHp}</span>
              <span>⚔️ ATK: {currentEnemy.stats.attack}</span>
              <span>🛡️ DEF: {currentEnemy.stats.defense}</span>
              <span>💨 SPD: {currentEnemy.stats.speed}</span>
            </div>
          </div>

          {message && (
            <div style={styles.message}>
              {message}
            </div>
          )}

          <div style={styles.actions}>
            <button
              onClick={handleFight}
              style={{ ...styles.button, ...styles.fightButton }}
              disabled={loading}
            >
              ⚔️ Fight
            </button>
            <button
              onClick={handleSneak}
              style={{ ...styles.button, ...styles.sneakButton }}
              disabled={loading}
            >
              🤫 Sneak
            </button>
            <button
              onClick={handleFlee}
              style={{ ...styles.button, ...styles.fleeButton }}
              disabled={loading}
            >
              🏃 Flee
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render room summary screen
  if (screen === 'summary') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Room Cleared! ✨</h2>
        </div>

        <div style={styles.content}>
          <p style={styles.message}>{message}</p>
          <p style={styles.text}>
            {dungeonRun!.currentRoom + 1} of {dungeonRun.rooms.length} rooms cleared
          </p>

          <button
            onClick={handleContinue}
            style={styles.button}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // Render complete screen
  if (screen === 'complete') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {battleResult?.won ? '🎉 Dungeon Complete!' : '💀 Defeated'}
          </h2>
        </div>

        <div style={styles.content}>
          <div style={styles.card}>
            <p style={styles.text}>
              {battleResult?.won
                ? `You conquered the dungeon! Final Score: ${finalScore}`
                : `You were defeated... Score: ${finalScore}`
              }
            </p>

            <button
              onClick={onExit}
              style={styles.button}
            >
              Exit Dungeon
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  } as const,
  backButton: {
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '20px',
    border: 'none',
    background: 'rgba(255, 107, 157, 0.2)',
    color: '#FF6B9D',
    cursor: 'pointer',
  } as const,
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #FF6B9D, #C09BD8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } as const,
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as const,
  card: {
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '16px',
    padding: '24px',
    border: '2px solid rgba(255, 107, 157, 0.2)',
  } as const,
  text: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
  } as const,
  list: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '2',
    textAlign: 'left' as const,
  } as const,
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '24px',
    border: 'none',
    background: 'linear-gradient(90deg, #FF6B9D, #C09BD8)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  } as const,
  roomImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '16px',
  } as const,
  enemyCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    padding: '16px',
    border: '2px solid rgba(255, 107, 157, 0.2)',
  } as const,
  enemyName: {
    margin: '0 0 4px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  } as const,
  enemyInfo: {
    margin: '0 0 12px',
    fontSize: '14px',
    color: '#999',
  } as const,
  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '14px',
    color: '#666',
  } as const,
  message: {
    padding: '12px',
    background: 'rgba(255, 107, 157, 0.1)',
    borderRadius: '8px',
    fontSize: '16px',
    color: '#FF6B9D',
    textAlign: 'center' as const,
    fontWeight: 'bold',
  } as const,
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  } as const,
  fightButton: {
    background: 'linear-gradient(90deg, #FF6B9D, #FF8A80)',
  } as const,
  sneakButton: {
    background: 'linear-gradient(90deg, #64B5F6, #81C784)',
  } as const,
  fleeButton: {
    background: 'linear-gradient(90deg, #90A4AE, #B0BEC5)',
  } as const,
};
