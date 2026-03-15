/**
 * BattleArena - Polished battle interface with animations and visual feedback
 *
 * Features:
 * - Floating damage numbers
 * - Shake and lunge animations
 * - Sound effects integration
 * - Battle log with descriptive text
 * - Smooth HP transitions
 * - Mobile-responsive design
 * - Victory/defeat celebrations
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCreatureStore } from '../../stores';
import { battleService } from '../../services';
import type { BattleMove } from '../../services';
import { soundService } from '../../services/soundService';
import { BattleLog, createLogEntry, BattleLogFormatters, type BattleLogEntry } from './BattleLog';
import { DamageNumber, useDamageNumbers } from './DamageNumber';

interface BattleArenaProps {
  opponentId: string;
  opponentName: string;
  opponentType: string;
  onBattleEnd: (won: boolean) => void;
  onBack: () => void;
  auto?: boolean; // New: Enable automatic battle mode
  opponentImage?: string; // New: Opponent's generated image
}

export type BattleResult = {
  won: boolean;
  damageDealt: number;
  damageTaken: number;
  rounds: number;
};

type AnimationState = 'idle' | 'attacking' | 'damaged' | 'victorious' | 'defeated';

export function BattleArena({
  opponentId,
  opponentName,
  opponentType,
  onBattleEnd,
  onBack,
  auto = false,
  opponentImage,
}: BattleArenaProps) {
  const { creature, battleStats, availableMoves } = useCreatureStore();
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [isBattling, setIsBattling] = useState(false);
  const [playerAnimation, setPlayerAnimation] = useState<AnimationState>('idle');
  const [opponentAnimation, setOpponentAnimation] = useState<AnimationState>('idle');
  const [selectedMove, setSelectedMove] = useState<BattleMove | null>(null);
  const [battleOver, setBattleOver] = useState(false);
  const [autoBattleStarted, setAutoBattleStarted] = useState(false);

  // Refs for creature cards
  const playerCardRef = useRef<HTMLDivElement>(null);
  const opponentCardRef = useRef<HTMLDivElement>(null);

  // Damage numbers hook
  const { damageNumbers, showDamage, removeNumber } = useDamageNumbers();

  // Initialize battle and start auto battle if enabled
  useEffect(() => {
    if (creature && battleStats) {
      setPlayerHealth(100);
      setOpponentHealth(100);
      setBattleLog([createLogEntry(`⚔️ A wild ${opponentName} appeared!`, 'info')]);

      // Start auto battle after a short delay
      if (auto && !autoBattleStarted) {
        setAutoBattleStarted(true);
        const timer = setTimeout(() => {
          runAutoBattle();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [creature, battleStats, opponentName]);

  // Play animation and reset
  const playAnimation = useCallback((target: 'player' | 'opponent', animation: AnimationState, duration: number = 500) => {
    if (target === 'player') {
      setPlayerAnimation(animation);
      setTimeout(() => setPlayerAnimation('idle'), duration);
    } else {
      setOpponentAnimation(animation);
      setTimeout(() => setOpponentAnimation('idle'), duration);
    }
  }, []);

  // Show damage number at target position
  const showDamageAtTarget = useCallback((
    target: 'player' | 'opponent',
    damage: number,
    options?: { isCritical?: boolean; isHealing?: boolean; color?: string }
  ) => {
    const element = target === 'player' ? playerCardRef.current : opponentCardRef.current;
    if (element) {
      showDamage(element, damage, options);
    }
  }, [showDamage]);

  // Calculate damage with effectiveness
  const calculateDamage = useCallback((move: BattleMove, isCritical: boolean): number => {
    const baseDamage = Math.floor(Math.random() * move.power) + 5;
    const criticalMultiplier = isCritical ? 1.5 : 1;
    return Math.floor(baseDamage * criticalMultiplier);
  }, []);

  // Check if hit lands
  const checkHit = useCallback((accuracy: number): boolean => {
    return Math.random() * 100 < accuracy;
  }, []);

  // Check for critical hit
  const checkCritical = useCallback((): boolean => {
    return Math.random() < 0.1; // 10% crit chance
  }, []);

  // Add log entry
  const addLog = useCallback((entry: BattleLogEntry) => {
    setBattleLog(prev => [...prev, entry]);
  }, []);

  // Run automatic battle (no user interaction needed)
  const runAutoBattle = useCallback(async () => {
    if (!battleStats || !creature || battleOver) return;

    setIsBattling(true);
    setAutoBattleStarted(true);

    const playerMoves = availableMoves.length > 0 ? availableMoves : battleService.getMoves(creature.type);
    const opponentMoves = battleService.getMoves(opponentType);

    // Battle loop - continue until someone wins
    while (!battleOver) {
      // Check if we should stop (component unmounted, etc.)
      if (!battleOver && playerHealth > 0 && opponentHealth > 0) {
        // Add round start
        addLog(BattleLogFormatters.roundStart(currentRound));

        // ===== PLAYER TURN (AUTO-SELECT MOVE) =====
        const playerMove = playerMoves[Math.floor(Math.random() * playerMoves.length)];
        addLog(BattleLogFormatters.usedMove(creature.name, playerMove.name));

        // Player attack animation
        playAnimation('player', 'attacking', 400);
        soundService.play('battle');

        await new Promise(resolve => setTimeout(resolve, 400));

        // Check if hit lands
        if (checkHit(playerMove.accuracy)) {
          const isCritical = checkCritical();
          const damage = calculateDamage(playerMove, isCritical);

          // Show damage and animate opponent
          showDamageAtTarget('opponent', damage, { isCritical });
          playAnimation('opponent', 'damaged', 500);
          soundService.play('hit');

          const newOpponentHealth = Math.max(0, opponentHealth - damage);
          setOpponentHealth(newOpponentHealth);

          // Add damage log
          if (isCritical) {
            addLog(BattleLogFormatters.criticalHit(damage));
          } else {
            addLog(BattleLogFormatters.dealtDamage(damage));
          }

          await new Promise(resolve => setTimeout(resolve, 600));

          // Check if opponent defeated
          if (newOpponentHealth <= 0) {
            addLog(BattleLogFormatters.fainted(opponentName));
            addLog(BattleLogFormatters.won());
            playAnimation('opponent', 'defeated', 1000);
            playAnimation('player', 'victorious', 2000);
            soundService.play('success');
            setBattleOver(true);
            setIsBattling(false);
            setTimeout(() => onBattleEnd(true), 2000);
            return;
          }
        } else {
          addLog(BattleLogFormatters.missed());
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // ===== OPPONENT TURN =====
        const opponentMove = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];
        addLog(BattleLogFormatters.usedMove(opponentName, opponentMove.name));

        // Opponent attack animation
        playAnimation('opponent', 'attacking', 400);

        await new Promise(resolve => setTimeout(resolve, 400));

        // Check if hit lands
        if (checkHit(opponentMove.accuracy)) {
          const isCritical = checkCritical();
          const damage = calculateDamage(opponentMove, isCritical);

          // Show damage and animate player
          showDamageAtTarget('player', damage, { isCritical });
          playAnimation('player', 'damaged', 500);
          soundService.play('hit');

          const newPlayerHealth = Math.max(0, playerHealth - damage);
          setPlayerHealth(newPlayerHealth);

          // Add damage log
          if (isCritical) {
            addLog(BattleLogFormatters.criticalHit(damage));
          } else {
            addLog(BattleLogFormatters.dealtDamage(damage));
          }

          await new Promise(resolve => setTimeout(resolve, 600));

          // Check if player defeated
          if (newPlayerHealth <= 0) {
            addLog(BattleLogFormatters.fainted(creature.name));
            addLog(BattleLogFormatters.lost());
            playAnimation('player', 'defeated', 1000);
            playAnimation('opponent', 'victorious', 2000);
            soundService.play('defeat');
            setBattleOver(true);
            setIsBattling(false);
            setTimeout(() => onBattleEnd(false), 2000);
            return;
          }
        } else {
          addLog(BattleLogFormatters.missed());
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // End of round - increment counter
        setCurrentRound(prev => prev + 1);

        // Small delay between rounds for readability
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Battle ended
        break;
      }
    }
  }, [
    battleStats,
    creature,
    battleOver,
    playerHealth,
    opponentHealth,
    currentRound,
    playerMoves,
    availableMoves,
    opponentMoves,
    onBattleEnd,
    playAnimation,
    checkHit,
    checkCritical,
    calculateDamage,
  ]);

  const handleMoveSelect = async (move: BattleMove) => {
    if (!battleStats || !creature || isBattling || battleOver) return;

    setIsBattling(true);
    setSelectedMove(move);

    // Add round start
    addLog(BattleLogFormatters.roundStart(currentRound));

    const playerMoves = availableMoves.length > 0 ? availableMoves : battleService.getMoves(creature.type);
    const opponentMoves = battleService.getMoves(opponentType);
    const opponentMove = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];

    // ===== PLAYER TURN =====
    addLog(BattleLogFormatters.usedMove(creature.name, move.name));

    // Player attack animation
    playAnimation('player', 'attacking', 400);
    soundService.play('battle');

    await new Promise(resolve => setTimeout(resolve, 400));

    // Check if hit lands
    if (checkHit(move.accuracy)) {
      const isCritical = checkCritical();
      const damage = calculateDamage(move, isCritical);

      // Show damage and animate opponent
      showDamageAtTarget('opponent', damage, { isCritical });
      playAnimation('opponent', 'damaged', 500);
      soundService.play('hit');

      const newOpponentHealth = Math.max(0, opponentHealth - damage);
      setOpponentHealth(newOpponentHealth);

      // Add damage log
      if (isCritical) {
        addLog(BattleLogFormatters.criticalHit(damage));
      } else {
        addLog(BattleLogFormatters.dealtDamage(damage));
      }

      await new Promise(resolve => setTimeout(resolve, 600));

      // Check if opponent defeated
      if (newOpponentHealth <= 0) {
        addLog(BattleLogFormatters.fainted(opponentName));
        addLog(BattleLogFormatters.won());
        playAnimation('opponent', 'defeated', 1000);
        playAnimation('player', 'victorious', 2000);
        soundService.play('success');
        setBattleOver(true);
        setIsBattling(false);
        setTimeout(() => onBattleEnd(true), 2000);
        return;
      }
    } else {
      addLog(BattleLogFormatters.missed());
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    // ===== OPPONENT TURN =====
    addLog(BattleLogFormatters.usedMove(opponentName, opponentMove.name));

    // Opponent attack animation
    playAnimation('opponent', 'attacking', 400);

    await new Promise(resolve => setTimeout(resolve, 400));

    // Check if hit lands
    if (checkHit(opponentMove.accuracy)) {
      const isCritical = checkCritical();
      const damage = calculateDamage(opponentMove, isCritical);

      // Show damage and animate player
      showDamageAtTarget('player', damage, { isCritical });
      playAnimation('player', 'damaged', 500);
      soundService.play('hit');

      const newPlayerHealth = Math.max(0, playerHealth - damage);
      setPlayerHealth(newPlayerHealth);

      // Add damage log
      if (isCritical) {
        addLog(BattleLogFormatters.criticalHit(damage));
      } else {
        addLog(BattleLogFormatters.dealtDamage(damage));
      }

      await new Promise(resolve => setTimeout(resolve, 600));

      // Check if player defeated
      if (newPlayerHealth <= 0) {
        addLog(BattleLogFormatters.fainted(creature.name));
        addLog(BattleLogFormatters.lost());
        playAnimation('player', 'defeated', 1000);
        playAnimation('opponent', 'victorious', 2000);
        soundService.play('defeat');
        setBattleOver(true);
        setIsBattling(false);
        setTimeout(() => onBattleEnd(false), 2000);
        return;
      }
    } else {
      addLog(BattleLogFormatters.missed());
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    // End of round
    setCurrentRound(prev => prev + 1);
    setIsBattling(false);
    setSelectedMove(null);
  };

  if (!creature || !battleStats) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading battle...</p>
      </div>
    );
  }

  const playerMoves = availableMoves.length > 0 ? availableMoves : battleService.getMoves(creature.type);

  // Get animation class
  const getAnimationClass = (state: AnimationState): string => {
    switch (state) {
      case 'attacking': return 'creature-card attacking';
      case 'damaged': return 'creature-card damaged';
      case 'victorious': return 'creature-card victorious';
      case 'defeated': return 'creature-card defeated';
      default: return 'creature-card';
    }
  };

  // Get HP bar color
  const getHpColor = (hp: number): string => {
    if (hp > 50) return '#4CAF50';
    if (hp > 20) return '#FFC107';
    return '#F44336';
  };

  return (
    <div style={styles.container} className="battle-container">
      {/* Damage Numbers */}
      {damageNumbers.map(num => (
        <DamageNumber
          key={num.id}
          damage={num.damage}
          isCritical={num.isCritical}
          isHealing={num.isHealing}
          x={num.x}
          y={num.y}
          color={num.color}
          onComplete={() => removeNumber(num.id)}
        />
      ))}

      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <h2 style={styles.title}>⚔️ Battle Arena</h2>
        <div style={styles.roundBadge}>
          Round {currentRound}
        </div>
      </div>

      {/* Battle Area */}
      <div style={styles.battleArea}>
        {/* Creatures */}
        <div style={styles.creaturesContainer}>
          {/* Player Creature */}
          <div
            ref={playerCardRef}
            style={styles.creatureCard}
            className={getAnimationClass(playerAnimation)}
          >
            {creature.imageUrl ? (
              <img
                src={creature.imageUrl}
                alt={creature.name}
                style={styles.creatureImage}
              />
            ) : (
              <div style={styles.creatureEmoji}>
                {creature.type === 'cat' ? '🐱' : creature.type === 'dog' ? '🐶' : '🐾'}
              </div>
            )}
            <p style={styles.creatureName}>{creature.name}</p>

            {/* HP Bar */}
            <div style={styles.hpContainer}>
              <div style={styles.hpText}>
                <span>HP</span>
                <span>{Math.round(playerHealth)}/100</span>
              </div>
              <div style={styles.hpBarBackground}>
                <div
                  style={{
                    ...styles.hpBarFill,
                    width: `${playerHealth}%`,
                    backgroundColor: getHpColor(playerHealth),
                  }}
                  className="smooth-hp-transition"
                />
              </div>
            </div>

            {/* Stats */}
            <div style={styles.statsContainer}>
              <span style={styles.statBadge}>
                ⚔️ {battleStats.attack}
              </span>
              <span style={styles.statBadge}>
                🛡️ {battleStats.defense}
              </span>
            </div>
          </div>

          {/* VS */}
          <div style={styles.vsDivider}>VS</div>

          {/* Opponent Creature */}
          <div
            ref={opponentCardRef}
            style={styles.creatureCard}
            className={getAnimationClass(opponentAnimation)}
          >
            {opponentImage ? (
              <img
                src={opponentImage}
                alt={opponentName}
                style={styles.creatureImage}
              />
            ) : (
              <div style={styles.creatureEmoji}>🥚</div>
            )}
            <p style={styles.creatureName}>{opponentName}</p>

            {/* HP Bar */}
            <div style={styles.hpContainer}>
              <div style={styles.hpText}>
                <span>HP</span>
                <span>{Math.round(opponentHealth)}/100</span>
              </div>
              <div style={styles.hpBarBackground}>
                <div
                  style={{
                    ...styles.hpBarFill,
                    width: `${opponentHealth}%`,
                    backgroundColor: getHpColor(opponentHealth),
                  }}
                  className="smooth-hp-transition"
                />
              </div>
            </div>

            {/* Stats */}
            <div style={styles.statsContainer}>
              <span style={{...styles.statBadge, opacity: 0.6}}>
                ⚔️ ??
              </span>
              <span style={{...styles.statBadge, opacity: 0.6}}>
                🛡️ ??
              </span>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <BattleLog entries={battleLog} />
      </div>

      {/* Move Buttons - Hidden in auto mode */}
      {!battleOver && !auto && (
        <div style={styles.movesContainer}>
          {!isBattling ? (
            <>
              <h3 style={styles.movesTitle}>Choose Your Move!</h3>
              <div style={styles.movesGrid}>
                {playerMoves.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoveSelect(move)}
                    disabled={isBattling}
                    className="move-button"
                    style={{
                      ...styles.moveButton,
                      ...(selectedMove === move ? styles.moveButtonSelected : {}),
                    }}
                  >
                    <div style={styles.moveName}>{move.name}</div>
                    <div style={styles.moveStats}>
                      Power: {move.power} | Acc: {move.accuracy}%
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={styles.thinkingContainer}>
              <div style={styles.spinner} className="animate-thinking" />
              <p style={styles.thinkingText}>Battling...</p>
            </div>
          )}
        </div>
      )}

      {/* Auto battle indicator */}
      {auto && !battleOver && (
        <div style={styles.movesContainer}>
          <div style={styles.thinkingContainer}>
            <div style={styles.spinner} className="animate-thinking" />
            <p style={styles.thinkingText}>
              {creature.name} is battling automatically...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFE5EC 0%, #F3E5F5 50%, #E3F2FD 100%)',
    padding: '16px',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFE5EC 0%, #F3E5F5 50%, #E3F2FD 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  loadingText: {
    fontSize: '18px',
    color: '#666',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  backButton: {
    padding: '10px 16px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(255, 107, 157, 0.1)',
    color: '#FF6B9D',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #FF6B9D, #C09BD8, #64B5F6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  roundBadge: {
    padding: '8px 14px',
    borderRadius: '20px',
    background: 'rgba(255, 107, 157, 0.1)',
    color: '#FF6B9D',
    fontSize: '13px',
    fontWeight: '600',
  },
  battleArea: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  creaturesContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  creatureCard: {
    textAlign: 'center',
    flex: '1',
    minWidth: '140px',
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'transform 0.3s ease, filter 0.3s ease',
  },
  creatureImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #FF6B9D',
    marginBottom: '8px',
  },
  creatureEmoji: {
    fontSize: '80px',
    marginBottom: '8px',
  },
  creatureName: {
    margin: '4px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  hpContainer: {
    marginBottom: '8px',
  },
  hpText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '4px',
    fontWeight: '600',
  },
  hpBarBackground: {
    height: '10px',
    background: '#f0f0f0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    transition: 'width 0.5s ease-out, background-color 0.3s ease',
  },
  statsContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  statBadge: {
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '12px',
    background: '#FFE5EC',
    color: '#FF6B9D',
    fontWeight: '600',
  },
  vsDivider: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FF6B9D',
    padding: '0 10px',
  },
  movesContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  movesTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  movesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  moveButton: {
    padding: '14px',
    borderRadius: '14px',
    border: '2px solid rgba(255, 107, 157, 0.3)',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  moveButtonSelected: {
    borderColor: '#FF6B9D',
    background: 'rgba(255, 107, 157, 0.05)',
  },
  moveName: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#333',
  },
  moveStats: {
    fontSize: '11px',
    color: '#666',
  },
  thinkingContainer: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #FF6B9D',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    margin: '0 auto 12px',
  },
  thinkingText: {
    margin: 0,
    fontSize: '14px',
  },
};
