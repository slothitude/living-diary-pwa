# Architecture Documentation

## System Architecture Overview

Living Diary PWA is built as a **client-side Progressive Web App** with a modular, component-based architecture. The application follows **React best practices** with **TypeScript** for type safety and **Zustand** for state management.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                    (React Components)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       State Management                        │
│                     (Zustand Stores)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Chat   │  │ Creature │  │  Tasks   │  │Discovery │  │
│  │  Store   │  │  Store   │  │  Store   │  │  Store   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↓                ↓                ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│                         Services Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │     API     │  │  Business   │  │    Data     │        │
│  │  Services   │  │   Logic     │  │  Access     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
         ↓                ↓                ↓
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ IndexedDB   │  │   Memory    │  │    Local    │        │
│  │  (Dexie.js) │  │   Cache     │  │  Storage    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      External Services                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Agent     │  │   Pixazo    │  │  SearXNG    │        │
│  │  Service    │  │   (Images)  │  │  (Search)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Architectural Principles

### 1. **Component-Based Design**

The UI is built from **reusable, composable components**:

```typescript
// Example: BattleArena component
interface BattleArenaProps {
  opponentId: string;
  opponentName: string;
  opponentType: string;
  auto?: boolean;              // Enable automatic mode
  opponentImage?: string;       // Generated image URL
  onBattleEnd: (won: boolean) => void;
  onBack: () => void;
}

export function BattleArena({ ... }: BattleArenaProps) {
  // Component logic
}
```

**Benefits:**
- Reusability across features
- Clear props interface
- Isolated component testing
- Easy maintenance

### 2. **State Management with Zustand**

Zustand provides **lightweight, type-safe state management**:

```typescript
// Creature store example
interface CreatureStore {
  creature: CreatureState | null;
  loading: boolean;

  // Actions
  createCreature: (type: string, name: string) => Promise<void>;
  evolveCreature: () => Promise<void>;
  updateHappiness: (delta: number) => void;
}

export const useCreatureStore = create<CreatureStore>((set, get) => ({
  creature: null,
  loading: false,

  createCreature: async (type, name) => {
    set({ loading: true });
    const creature = await creatureService.create(type, name);
    set({ creature, loading: false });
  },

  // ... other actions
}));
```

**Benefits:**
- Simple, boilerplate-free API
- TypeScript support out of the box
- No providers needed
- Easy to test

### 3. **Service Layer Pattern**

Business logic is encapsulated in **service modules**:

```typescript
// Image generation service
class ImageService {
  async generateCreature(
    type: string,
    name: string,
    size: number = 512
  ): Promise<string> {
    const prompt = this.buildPrompt(type, name);
    const { url } = await this.api.generate(prompt, size);
    return url;
  }

  private buildPrompt(type: string, name: string): string {
    return ` adorable ${type} creature named ${name}, ...`;
  }
}

export const imageService = new ImageService();
```

**Benefits:**
- Clear separation of concerns
- Easy to mock for testing
- Reusable across components
- Centralized business logic

### 4. **TypeScript for Type Safety**

All code is **fully typed** for compile-time safety:

```typescript
// Creature type definition
export interface CreatureState {
  id: string;
  userId: string;
  name: string;
  type: CreatureType;
  evolutionStage: EvolutionStage;
  imageUrl?: string;
  happiness: number;
  level?: number;
  stats?: {
    attack: number;
    defense: number;
    speed: number;
  };
  createdAt: number;
  lastInteraction: number;
}

// Evolution stage is a union type
export type EvolutionStage =
  | 'egg'
  | 'hatchling'
  | 'companion'
  | 'friend'
  | 'partner';
```

**Benefits:**
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Safer refactoring

### 5. **Offline-First Storage**

IndexedDB (via Dexie.js) provides **persistent offline storage**:

```typescript
// Database schema
export class LivingDiaryDB extends Dexie {
  messages!: Table<ChatMessage>;
  tasks!: Table<Task>;
  creatures!: Table<CreatureState>;
  imageCache!: Table<CachedImage>;
  worldZones!: Table<WorldZone>;
  dungeons!: Table<Dungeon>;
  inventory!: Table<InventoryItem>;
  items!: Table<Item>;
  worldEvents!: Table<WorldEvent>;
  bestiary!: Table<BestiaryEntry>;

  constructor() {
    super('LivingDiaryDB');

    this.version(2).stores({
      messages: 'id, userId, timestamp, isJournalEntry',
      tasks: 'id, userId, status, createdAt, scheduledFor',
      creatures: 'id, userId, evolutionStage',
      imageCache: 'promptHash, category, generatedAt',
      worldZones: '[biomeId+zoneIndex], discovered',
      dungeons: 'zoneId, completed, lastRun',
      inventory: 'creatureId, itemId',
      items: 'id, type, rarity',
      worldEvents: 'eventKey, active, startDate, endDate',
      bestiary: 'enemyKey, encountered, defeated',
    });
  }
}
```

**Benefits:**
- Works without internet
- Fast data access
- Large storage capacity
- Index-based queries

---

## Component Architecture

### Feature-Based Structure

Components are organized by **feature** rather than type:

```
src/components/
├── Battle/           # Battle system
│   ├── BattleArena.tsx
│   ├── BattleLog.tsx
│   ├── DamageNumber.tsx
│   └── index.ts
├── Chat/             # Chat interface
│   ├── ChatInterface.tsx
│   ├── MessageList.tsx
│   ├── InputBar.tsx
│   └── MoodPicker.tsx
├── Creature/         # Creature system
│   ├── CreatureAvatar.tsx
│   ├── CreatureInfo.tsx
│   ├── CreatureCreation.tsx
│   └── EvolutionSequence.tsx
├── World/            # World building
│   ├── WorldMap.tsx
│   ├── DungeonRunner.tsx
│   ├── Inventory.tsx
│   ├── CraftingBench.tsx
│   └── Bestiary.tsx
└── ...
```

**Benefits:**
- Easy to find related files
- Clear feature boundaries
- Independent feature development
- Simplified testing

### Component Hierarchy

```
App.tsx
├── ChatInterface
│   ├── MessageList
│   │   └── MessageItem
│   └── InputBar
│       └── MoodPicker
├── CreatureAvatar
│   └── CreatureInfo
├── TaskList
│   └── TaskItem
├── BattleArena
│   ├── CreatureCard
│   ├── BattleLog
│   └── DamageNumber
└── WorldHub
    ├── WorldMap
    │   └── BiomeCard
    ├── DungeonRunner
    │   └── BattleArena
    └── Inventory
```

---

## Data Flow Architecture

### Unidirectional Data Flow

The application follows **React's unidirectional data flow**:

```
User Action → Component Event Handler → Store Action → Service → API
                                                           ↓
                                                   State Update
                                                           ↓
                                                    Component Re-render
```

### Example: Sending a Chat Message

```typescript
// 1. User types message
<InputBar onSend={handleSendMessage} />

// 2. Component handler
function handleSendMessage(content: string) {
  chatStore.sendMessage(content);
}

// 3. Store action
sendMessage: async (content: string) => {
  const message = await aiService.chat(
    [{ role: 'user', content }],
    creature.name,
    creature.type
  );

  // Update state
  set({ messages: [...get().messages, message] });

  // Persist to storage
  await messageStorage.add(message);
}

// 4. UI updates automatically
<MessageList messages={messages} />
```

---

## Service Layer Architecture

### Service Categories

#### 1. **API Services**

Handle communication with external APIs:

```typescript
// Agent service - AI chat
export class AgentService {
  async chat(messages: Message[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/agent/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    return response.json();
  }
}

// Image service - Pixazo API
export class ImageService {
  async generate(prompt: string, size: number): Promise<ImageResponse> {
    const response = await fetch('https://api.pixazo.ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model: 'flux-schnell', size }),
    });

    return response.json();
  }
}
```

#### 2. **Business Logic Services**

Contain application-specific logic:

```typescript
// Battle service
export class BattleService {
  calculateDamage(
    attacker: BattleStats,
    defender: BattleStats,
    move: Move
  ): number {
    const baseDamage = move.power;
    const attackMultiplier = attacker.attack / defender.defense;
    const randomFactor = 0.85 + Math.random() * 0.15;
    const criticalHit = Math.random() < 0.1 ? 1.5 : 1;

    return Math.floor(baseDamage * attackMultiplier * randomFactor * criticalHit);
  }

  isHit(attackerSpeed: number, defenderSpeed: number): boolean {
    const accuracy = attackerSpeed / (attackerSpeed + defenderSpeed);
    return Math.random() < accuracy;
  }
}

// Dungeon service
export class DungeonService {
  async startDungeonRun(biomeId: string, zoneIndex: number): Promise<DungeonRun> {
    const rooms = this.generateRooms(5);
    const dungeon = await db.dungeons.add({
      zoneId: `${biomeId}-${zoneIndex}`,
      rooms,
      completed: false,
      highScore: 0,
      lastRun: Date.now(),
    });

    return { dungeonId: dungeon, currentRoom: 0, rooms };
  }
}
```

#### 3. **Data Access Services**

Manage IndexedDB operations:

```typescript
// Storage service
export const messageStorage = {
  async add(message: ChatMessage): Promise<void> {
    await db.messages.add(message);
  },

  async getByUserId(userId: string): Promise<ChatMessage[]> {
    return await db.messages
      .where('userId')
      .equals(userId)
      .sortBy('timestamp');
  },

  async updateMessage(id: string, updates: Partial<ChatMessage>): Promise<void> {
    await db.messages.update(id, updates);
  }
};
```

---

## Performance Architecture

### Code Splitting

The app uses **React.lazy()** for code splitting:

```typescript
// Lazy load feature components
const BattleArena = lazy(() => import('./components/Battle/BattleArena'));
const SkillTree = lazy(() => import('./components/Skills/SkillTree'));
const QuestHub = lazy(() => import('./components/Quests/QuestHub'));

// Suspense wrapper
<Suspense fallback={<LoadingScreen />}>
  {showBattle && <BattleArena {...props} />}
</Suspense>
```

**Benefits:**
- Smaller initial bundle
- Faster load times
- Load features on demand

### Image Caching

Generated images are **cached permanently**:

```typescript
// Image cache service
export class ImageCacheService {
  async getCachedOrGenerate(
    prompt: string,
    category: 'zone' | 'enemy' | 'item',
    size: number
  ): Promise<{ url: string }> {
    const hash = this.hashPrompt(prompt);

    // Check cache
    const cached = await db.imageCache.where('promptHash').equals(hash).first();
    if (cached) {
      return { url: cached.imageUrl };
    }

    // Generate new image
    const url = await imageService.generate(prompt, size);

    // Cache it
    await db.imageCache.add({
      promptHash: hash,
      prompt,
      imageUrl: url,
      generatedAt: Date.now(),
      category,
    });

    return { url };
  }
}
```

**Benefits:**
- Never regenerate the same image
- Instant load on subsequent visits
- Reduced API costs

### Service Worker Caching

The PWA caches **static assets** for offline use:

```typescript
// vite.config.ts - PWA plugin
VitePWA({
  strategies: 'networkFirst',
  registerType: 'autoUpdate',
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
});
```

---

## Security Architecture

### API Key Management

API keys are stored in **environment variables**:

```typescript
// .env (not committed)
VITE_PIXAZO_API_KEY=sk-xxxxx

// Used in code
const apiKey = import.meta.env.VITE_PIXAZO_API_KEY;
```

**Best Practices:**
- Never commit .env files
- Use .env.example as template
- Different keys for dev/prod
- Rotate keys regularly

### Data Privacy

- **All data stored locally** - no cloud sync
- **No user tracking** - no analytics
- **Private by default** - everything stays on device

---

## Testing Architecture

### Unit Testing

```typescript
// Example: Battle service tests
describe('BattleService', () => {
  it('calculates damage correctly', () => {
    const attacker = { attack: 20, defense: 10, speed: 15, maxHp: 100 };
    const defender = { attack: 15, defense: 15, speed: 10, maxHp: 100 };
    const move = { power: 30, name: 'Tackle' };

    const damage = battleService.calculateDamage(attacker, defender, move);

    expect(damage).toBeGreaterThan(0);
    expect(damage).toBeLessThanOrEqual(100);
  });

  it('handles critical hits', () => {
    // Test critical hit logic
  });
});
```

### Integration Testing

```typescript
// Example: End-to-end feature test
describe('Dungeon Flow', () => {
  it('completes a dungeon run', async () => {
    const { getByText, findByText } = render(<App />);

    // Navigate to dungeon
    fireEvent.click(getByText('World'));
    fireEvent.click(getByText('Verdant Forest'));
    fireEvent.click(getByText('Enter Dungeon'));

    // Start battle
    fireEvent.click(getByText('Fight'));

    // Wait for victory
    await findByText('Victory!');

    // Check rewards
    expect(getByText('+50 XP')).toBeInTheDocument();
  });
});
```

---

## Deployment Architecture

### Build Process

```bash
# Development
npm run dev              # Vite dev server with HMR

# Production
npm run build            # TypeScript → Build → Optimize
npm run preview          # Preview production build locally
```

### Production Optimizations

- **Tree shaking** - Remove unused code
- **Code splitting** - Lazy load features
- **Asset compression** - Minify JS/CSS
- **Image optimization** - Serve WebP when supported
- **CDN deployment** - Fast global delivery

---

## Monitoring & Debugging

### Error Tracking

```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);

    // Log to service (optional)
    // errorLoggingService.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen />;
    }

    return this.props.children;
  }
}
```

### Performance Monitoring

```typescript
// Performance marks
performance.mark('battle-start');

// ... battle logic ...

performance.mark('battle-end');
performance.measure('battle-duration', 'battle-start', 'battle-end');

const measure = performance.getEntriesByName('battle-duration')[0];
console.log(`Battle took ${measure.duration}ms`);
```

---

## Future Architecture Improvements

### Planned Enhancements

1. **Server-Side Sync** - Optional cloud backup
2. **Real-Time Multiplayer** - Battle other creatures
3. **Offline AI** - WebAssembly-based local AI
4. **Push Notifications** - Server-scheduled reminders
5. **Analytics Dashboard** - Mood trends and insights

---

## Architecture Decision Records

### Why Zustand over Redux?

- **Simpler API** - No boilerplate
- **Smaller bundle** - 1KB vs 15KB
- **TypeScript-first** - Better type inference
- **No providers** - Use anywhere

### Why IndexedDB over LocalStorage?

- **Larger capacity** - GBs vs MBs
- **Async API** - Non-blocking
- **Index-based queries** - Fast lookups
- **Structured data** - Better schema support

### Why Vite over Create React App?

- **Faster dev server** - ESM-based HMR
- **Better build performance** - Rollup under the hood
- **Native ESM** - No bundling in dev
- **Modern defaults** - Less config needed

---

**Last Updated:** March 15, 2026
