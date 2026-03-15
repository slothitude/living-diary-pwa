import { useEffect, useState } from 'react';
import { ChatInterface } from './components/Chat/ChatInterface';
import { CreatureAvatar } from './components/Creature/CreatureAvatar';
import { CreatureCreation } from './components/Creature/CreatureCreation';
import { BattleArena } from './components/Battle/BattleArena';
import { SkillTree } from './components/Skills/SkillTree';
import { QuestHub } from './components/Quests/QuestHub';
import { SocialHub } from './components/Social/SocialHub';
import { WorldHub } from './components/World';
import { Calendar } from './components/Calendar';
import { FeatureMenu } from './components/Menu/FeatureMenu';
import { SoulViewer } from './components/Soul/SoulViewer';
import { useChatStore, useCreatureStore, useDiscoveryStore } from './stores';
import { reminderService } from './services';
import { resetAllData } from './utils/reset';
import { soundService } from './services/soundService';

function App() {
  const { userId, setUserId } = useChatStore();
  const { creature, loadCreature } = useCreatureStore();
  const { isDiscovered, discoverFeature, markIntroShown } = useDiscoveryStore();
  const [showCreatureCreation, setShowCreatureCreation] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showWorld, setShowWorld] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSoul, setShowSoul] = useState(false);

  useEffect(() => {
    // Initialize user ID
    let storedUserId = localStorage.getItem('userId');

    if (!storedUserId) {
      storedUserId = Date.now().toString();
      localStorage.setItem('userId', storedUserId);
    }

    setUserId(storedUserId);

    // Load creature data
    loadCreature();

    // Request notification permission
    reminderService.requestPermission();

    // Start reminder checker
    reminderService.startReminderCheck();
  }, [setUserId, loadCreature]);

  useEffect(() => {
    // Show creature creation if no creature exists
    if (!creature && userId) {
      const timer = setTimeout(() => {
        if (!creature) {
          setShowCreatureCreation(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [creature, userId]);

  // Show creature creation flow first
  if (showCreatureCreation) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #FFE5EC 0%, #F3E5F5 50%, #E3F2FD 100%)',
        minHeight: '100vh'
      }}>
        <CreatureCreation />
      </div>
    );
  }

  // Full-screen overlays
  if (showSoul) {
    return <SoulViewer onClose={() => setShowSoul(false)} />;
  }

  if (showBattle) {
    return (
      <BattleArena
        opponentId="opponent-1"
        opponentName="Wild Creature"
        opponentType="cat"
        auto={true}
        onBattleEnd={(won) => {
          setShowBattle(false);
        }}
        onBack={() => setShowBattle(false)}
      />
    );
  }

  if (showSkillTree) {
    return <SkillTree onClose={() => setShowSkillTree(false)} />;
  }

  if (showQuests) {
    return <QuestHub onClose={() => setShowQuests(false)} />;
  }

  if (showSocial) {
    return <SocialHub onClose={() => setShowSocial(false)} />;
  }

  if (showWorld) {
    return <WorldHub onClose={() => setShowWorld(false)} />;
  }

  if (showCalendar) {
    return <Calendar onClose={() => setShowCalendar(false)} />;
  }

  // Main chat view - the heart of the app!
  return (
    <div style={{
      minHeight: '100vh',
      height: '100dvh',
      maxHeight: '100dvh',
      background: 'linear-gradient(135deg, #FFE5EC 0%, #F3E5F5 50%, #E3F2FD 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Creature header - just your friend saying hi! */}
      {creature && (
        <div className="glass" style={{
          padding: '12px 16px',
          borderBottom: '2px solid rgba(255, 107, 157, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CreatureAvatar
              creature={creature}
              size="sm"
              onClick={() => {/* Just show the creature being happy! */}}
            />
            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #FF6B9D, #C09BD8, #64B5F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {creature.name}
              </p>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#999'
              }}>
                here with you 💚
              </p>
            </div>

            {/* Reset button - hidden in corner */}
            <button
              onClick={() => {
                if (confirm('Start fresh? This will clear all data including your creature and messages.')) {
                  resetAllData();
                }
              }}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 107, 157, 0.1)',
                color: '#999',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Reset all data"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 157, 0.2)';
                e.currentTarget.style.color = '#FF6B9D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 157, 0.1)';
                e.currentTarget.style.color = '#999';
              }}
            >
              🔄 Reset
            </button>

            {/* Action buttons - only Menu and Calendar visible */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {/* Soul button - view creature's infinite memories */}
              <button
                onClick={() => {
                  soundService.play('open');
                  setShowSoul(true);
                }}
                className="anime-button"
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  borderRadius: '20px'
                }}
                title="View my soul and memories"
              >
                💫 Soul
              </button>

              {/* Menu button - shows discovered features */}
              <button
                onClick={() => {
                  soundService.play('open');
                  setShowMenu(true);
                }}
                className="anime-button"
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  borderRadius: '20px'
                }}
                title="What should we do?"
              >
                📜 Menu
              </button>

              {/* Calendar button - always available */}
              <button
                onClick={() => {
                  soundService.play('notification');
                  setShowCalendar(true);
                }}
                className="anime-button"
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '20px'
                }}
                title="View calendar & reminders"
              >
                📅 Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main chat - where the magic happens! */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ChatInterface />
      </div>

      {/* Feature Menu Modal */}
      {showMenu && (
        <FeatureMenu
          onClose={() => setShowMenu(false)}
          onFeatureSelect={(feature) => {
            setShowMenu(false);
            switch (feature) {
              case 'battle':
                setShowBattle(true);
                break;
              case 'skills':
                setShowSkillTree(true);
                break;
              case 'quests':
                setShowQuests(true);
                break;
              case 'social':
                setShowSocial(true);
                break;
              case 'world':
                setShowWorld(true);
                break;
              case 'calendar':
                setShowCalendar(true);
                break;
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
