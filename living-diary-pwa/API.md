# API Documentation

This document describes all service interfaces, API endpoints, and data contracts used in Living Diary PWA.

---

## Table of Contents

- [External APIs](#external-apis)
  - [Agent Service API](#agent-service-api)
  - [Pixazo Image API](#pixazo-image-api)
  - [SearXNG Search API](#searxng-search-api)
- [Internal Services](#internal-services)
  - [Battle Service](#battle-service)
  - [Dungeon Service](#dungeon-service)
  - [Enemy Service](#enemy-service)
  - [Drop Service](#drop-service)
  - [Image Cache Service](#image-cache-service)
  - [World Events Service](#world-events-service)
- [Data Contracts](#data-contracts)

---

## External APIs

### Agent Service API

**Base URL:** `http://localhost:3001` (configurable via `VITE_AGENT_SERVICE_URL`)

#### POST /agent/message

Send a chat message and receive AI response (streaming).

**Request:**

```typescript
interface ChatRequest {
  userId: string;
  message: string;
  creatureName: string;
  creatureType: string;
  conversationHistory?: Message[];
}
```

**Response (Server-Sent Events):**

```typescript
// Events:
// - agent_start: Agent started processing
// - turn_start: New turn started
// - message_start: Message generation started
// - message_update: Partial message content (streaming)
// - message_end: Message complete
// - turn_end: Turn ended
// - complete: Request complete

interface MessageUpdate {
  event: string;
  content: string;
  done: boolean;
}
```

**Example:**

```typescript
const response = await fetch('http://localhost:3001/agent/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    message: 'Hello!',
    creatureName: 'Bill',
    creatureType: 'worm',
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data.event, data.content);
    }
  }
}
```

#### GET /agent/conversation/:userId

Get conversation history for a user.

**Request:**

```typescript
const userId = 'user-123';
const response = await fetch(`http://localhost:3001/agent/conversation/${userId}`);
```

**Response:**

```typescript
interface ConversationResponse {
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

#### POST /agent/reset/:userId

Clear conversation history for a user.

**Request:**

```typescript
await fetch(`http://localhost:3001/agent/reset/user-123`, {
  method: 'POST',
});
```

**Response:**

```typescript
interface ResetResponse {
  success: boolean;
  message: string;
}
```

#### GET /agent/health

Health check endpoint.

**Response:**

```typescript
interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  uptime: number;
}
```

---

### Pixazo Image API

**Base URL:** `https://api.pixazo.ai`

**Authentication:** Bearer token via `VITE_PIXAZO_API_KEY`

#### POST /generate

Generate an image from a text prompt.

**Request:**

```typescript
interface GenerateRequest {
  prompt: string;
  model: 'flux-schnell' | 'flux-pro';
  size: 512 | 640 | 768 | 896 | 1024;
  num_inference_steps?: number;
  guidance_scale?: number;
}

const response = await fetch('https://api.pixazo.ai/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_PIXAZO_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'adorable cat creature',
    model: 'flux-schnell',
    size: 512,
  }),
});
```

**Response:**

```typescript
interface GenerateResponse {
  success: boolean;
  url: string;
  id: string;
  created_at: number;
}
```

**Example Usage:**

```typescript
// Image generation service
export class ImageService {
  async generate(prompt: string, size: number = 512): Promise<string> {
    const response = await fetch('https://api.pixazo.ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PIXAZO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model: 'flux-schnell', size }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data: GenerateResponse = await response.json();
    return data.url;
  }
}
```

---

### SearXNG Search API

**Base URL:** Configurable via `VITE_SEARXNG_URL`

#### GET /search

Search the web for information.

**Request:**

```typescript
interface SearchRequest {
  q: string;              // Search query
  format?: 'json';        // Response format
  language?: 'en';        // Search language
  time_range?: 'day' | 'week' | 'month' | 'year';
}

const params = new URLSearchParams({
  q: 'typescript best practices',
  format: 'json',
  language: 'en',
});

const response = await fetch(
  `${import.meta.env.VITE_SEARXNG_URL}/search?${params}`
);
```

**Response:**

```typescript
interface SearchResponse {
  query: string;
  results: SearchResult[];
}

interface SearchResult {
  title: string;
  url: string;
  content: string;
  engine: string;
  category: string;
  score: number;
}
```

---

## Internal Services

### Battle Service

Manages battle logic, damage calculations, and combat flow.

#### calculateDamage()

Calculate damage for an attack.

```typescript
interface BattleStats {
  attack: number;
  defense: number;
  speed: number;
  maxHp: number;
}

interface Move {
  name: string;
  power: number;
  type: string;
}

function calculateDamage(
  attacker: BattleStats,
  defender: BattleStats,
  move: Move
): number {
  const baseDamage = move.power;
  const attackMultiplier = attacker.attack / defender.defense;
  const randomFactor = 0.85 + Math.random() * 0.15; // 0.85 - 1.0
  const isCritical = Math.random() < 0.1; // 10% crit chance
  const criticalMultiplier = isCritical ? 1.5 : 1;

  return Math.floor(
    baseDamage * attackMultiplier * randomFactor * criticalMultiplier
  );
}
```

#### isHit()

Determine if an attack hits.

```typescript
function isHit(
  attackerSpeed: number,
  defenderSpeed: number
): boolean {
  const accuracy = attackerSpeed / (attackerSpeed + defenderSpeed);
  return Math.random() < accuracy;
}
```

#### createBattleLog()

Create a battle log entry.

```typescript
interface BattleLogEntry {
  type: 'info' | 'damage' | 'critical' | 'miss' | 'healing' | 'success';
  message: string;
  timestamp: number;
}

function createBattleLog(
  type: BattleLogEntry['type'],
  message: string
): BattleLogEntry {
  return {
    type,
    message,
    timestamp: Date.now(),
  };
}
```

---

### Dungeon Service

Manages dungeon runs, room generation, and progression.

#### startDungeonRun()

Begin a new dungeon run.

```typescript
interface DungeonRun {
  dungeonId: number;
  zoneId: string;
  currentRoom: number;
  rooms: DungeonRoom[];
  completed: boolean;
  highScore: number;
}

async function startDungeonRun(
  biomeId: string,
  zoneIndex: number,
  level: number
): Promise<DungeonRun> {
  const rooms = generateRooms(5, level);
  const dungeonId = await db.dungeons.add({
    zoneId: `${biomeId}-${zoneIndex}`,
    rooms,
    completed: false,
    highScore: 0,
    lastRun: Date.now(),
  });

  return {
    dungeonId,
    zoneId: `${biomeId}-${zoneIndex}`,
    currentRoom: 0,
    rooms,
    completed: false,
    highScore: 0,
  };
}
```

#### generateRooms()

Generate dungeon rooms.

```typescript
interface DungeonRoom {
  roomIndex: number;
  roomType: 'cavern' | 'corridor' | 'shrine' | 'lair' | 'boss';
  imageUrl?: string;
  defeated: boolean;
  lootCollected: boolean;
}

function generateRooms(count: number, level: number): DungeonRoom[] {
  const types: Array<DungeonRoom['roomType']> = [
    'cavern',
    'corridor',
    'shrine',
    'lair',
  ];

  return Array.from({ length: count }, (_, i) => ({
    roomIndex: i,
    roomType: i === count - 1 ? 'boss' : types[Math.floor(Math.random() * types.length)],
    defeated: false,
    lootCollected: false,
  }));
}
```

#### completeRoom()

Mark a room as complete.

```typescript
async function completeRoom(
  dungeonId: number,
  roomIndex: number,
  enemyId: string
): Promise<void> {
  await db.dungeons.update(dungeonId, {
    currentRoom: roomIndex + 1,
  });
}
```

---

### Enemy Service

Manages enemy data, spawning, and bestiary tracking.

#### getRoomEnemy()

Get an enemy for a dungeon room.

```typescript
interface Enemy {
  id: string;
  name: string;
  element: string;
  level: number;
  stats: {
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  imageUrl?: string;
}

async function getRoomEnemy(
  biomeId: string,
  roomType: string,
  level: number
): Promise<Enemy> {
  const enemyTable = getEnemyTableForBiome(biomeId);
  const enemyKey = enemyTable[Math.floor(Math.random() * enemyTable.length)];

  const baseStats = getBaseStats(enemyKey);
  const scaledStats = scaleStats(baseStats, level);

  return {
    id: `enemy-${Date.now()}`,
    name: formatName(enemyKey),
    element: getElementForBiome(biomeId),
    level,
    stats: scaledStats,
  };
}
```

#### updateBestiary()

Update bestiary with encounter/defeat data.

```typescript
interface BestiaryEntry {
  id?: number;
  enemyKey: string;
  name: string;
  element: string;
  imageUrl?: string;
  encountered: boolean;
  defeated: boolean;
  timesDefeated: number;
}

async function updateBestiary(
  enemyKey: string,
  name: string,
  element: string,
  imageUrl: string,
  defeated: boolean
): Promise<void> {
  const existing = await db.bestiary.where('enemyKey').equals(enemyKey).first();

  if (existing) {
    await db.bestiary.update(existing.id!, {
      encountered: true,
      defeated: defeated || existing.defeated,
      timesDefeated: defeated ? existing.timesDefeated + 1 : existing.timesDefeated,
    });
  } else {
    await db.bestiary.add({
      enemyKey,
      name,
      element,
      imageUrl,
      encountered: true,
      defeated,
      timesDefeated: defeated ? 1 : 0,
    });
  }
}
```

---

### Drop Service

Manages loot tables and item generation.

#### rollDrop()

Roll for item drop.

```typescript
interface Item {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  type: 'weapon' | 'armor' | 'accessory' | 'material';
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
  description: string;
}

async function rollDrop(
  biomeId: string,
  zoneLevel: number,
  isBoss: boolean = false
): Promise<Item | null> {
  const dropTable = getDropTableForBiome(biomeId);

  // Rarity roll
  const roll = Math.random() * 100;
  let rarity: Item['rarity'];

  if (isBoss) {
    rarity = roll < 30 ? 'rare' : 'legendary';
  } else {
    if (roll < 60) rarity = 'common';
    else if (roll < 90) rarity = 'rare';
    else rarity = 'legendary';
  }

  // Select item from rarity tier
  const items = dropTable[rarity];
  const itemTemplate = items[Math.floor(Math.random() * items.length)];

  return {
    id: `item-${Date.now()}`,
    name: itemTemplate.name,
    rarity,
    type: itemTemplate.type,
    stats: scaleStats(itemTemplate.stats, zoneLevel),
    description: itemTemplate.description,
  };
}
```

---

### Image Cache Service

Caches generated images to prevent duplicate generation.

#### getCachedOrGenerate()

Get cached image or generate new one.

```typescript
interface CachedImage {
  id?: number;
  promptHash: string;
  prompt: string;
  imageUrl: string;
  generatedAt: number;
  category: 'zone' | 'room' | 'enemy' | 'item' | 'boss' | 'event';
}

async function getCachedOrGenerate(
  prompt: string,
  category: CachedImage['category'],
  size: number = 512
): Promise<{ url: string }> {
  // Hash the prompt
  const hash = simpleHash(prompt);

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

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}
```

---

### World Events Service

Manages seasonal events and modifiers.

#### getActiveEvents()

Get currently active events.

```typescript
interface EventDefinition {
  eventKey: string;
  name: string;
  description: string;
  startMonth: number; // 0-11 (Jan-Dec)
  endMonth: number;
  modifiers: {
    dropRateBonus?: number;
    xpBonus?: number;
    specialEnemy?: string;
    exclusiveCraftable?: string;
  };
}

function getActiveEvents(): EventDefinition[] {
  const now = new Date();
  const currentMonth = now.getMonth();

  return EVENTS.filter(event => {
    if (event.startMonth <= event.endMonth) {
      return currentMonth >= event.startMonth && currentMonth <= event.endMonth;
    } else {
      // Event spans year boundary (e.g., Dec-Jan)
      return currentMonth >= event.startMonth || currentMonth <= event.endMonth;
    }
  });
}
```

#### getActiveModifiers()

Get combined modifiers from active events.

```typescript
interface ActiveModifiers {
  dropRateBonus: number;
  xpBonus: number;
  specialEnemy?: string;
  exclusiveCraftable?: string;
}

function getActiveModifiers(): ActiveModifiers {
  const activeEvents = getActiveEvents();

  return activeEvents.reduce(
    (acc, event) => ({
      dropRateBonus: (acc.dropRateBonus || 0) + (event.modifiers.dropRateBonus || 0),
      xpBonus: (acc.xpBonus || 0) + (event.modifiers.xpBonus || 0),
      specialEnemy: event.modifiers.specialEnemy || acc.specialEnemy,
      exclusiveCraftable: event.modifiers.exclusiveCraftable || acc.exclusiveCraftable,
    }),
    {
      dropRateBonus: 0,
      xpBonus: 0,
      specialEnemy: undefined,
      exclusiveCraftable: undefined,
    }
  );
}
```

---

## Data Contracts

### Creature State

```typescript
interface CreatureState {
  id: string;
  userId: string;
  name: string;
  type: CreatureType;
  evolutionStage: EvolutionStage;
  avatarEmoji?: string;
  imageUrl?: string;
  happiness: number;
  interactions?: number;
  level?: number;
  stats?: {
    attack: number;
    defense: number;
    speed: number;
  };
  createdAt: number;
  lastInteraction: number;
}

type CreatureType = string; // Any string: cat, dragon, space-whale, etc.

type EvolutionStage = 'egg' | 'hatchling' | 'companion' | 'friend' | 'partner';
```

### Chat Message

```typescript
interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isJournalEntry?: boolean;
  images?: ChatMessageImage[];
  mood?: Mood;
}

interface ChatMessageImage {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  alt?: string;
}

type Mood = 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful';
```

### Task

```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  createdAt: number;
  scheduledFor?: number;
  completedAt?: number;
  reminders?: Reminder[];
}
```

### Reminder

```typescript
interface Reminder {
  id: string;
  taskId: string;
  reminderTime: number;
  sent: boolean;
}
```

### World Zone

```typescript
interface WorldZone {
  id?: number;
  biomeId: string;
  zoneIndex: number;
  name: string;
  imageUrl?: string;
  discovered: boolean;
  enemyTable: string[];
  dropTable: string[];
}
```

### Dungeon

```typescript
interface Dungeon {
  id?: number;
  zoneId: string;
  rooms: DungeonRoom[];
  completed: boolean;
  highScore: number;
  lastRun: number;
}

interface DungeonRoom {
  roomIndex: number;
  roomType: 'cavern' | 'corridor' | 'shrine' | 'lair' | 'boss';
  imageUrl?: string;
  defeated: boolean;
  lootCollected: boolean;
}
```

### Inventory Item

```typescript
interface InventoryItem {
  id?: number;
  creatureId: string;
  itemId: string;
  quantity: number;
  equippedSlot?: 'weapon' | 'armor' | 'accessory' | null;
}
```

### Item

```typescript
interface Item {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  type: 'weapon' | 'armor' | 'accessory' | 'material';
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
  };
  imageUrl?: string;
  recipe?: { itemId: string; quantity: number }[];
  description: string;
}
```

### World Event

```typescript
interface WorldEvent {
  id?: number;
  eventKey: string;
  name: string;
  startDate: number;
  endDate: number;
  imageUrl?: string;
  active: boolean;
  modifiers: {
    dropRateBonus?: number;
    xpBonus?: number;
    specialEnemy?: string;
    exclusiveCraftable?: string;
  };
}
```

### Bestiary Entry

```typescript
interface BestiaryEntry {
  id?: number;
  enemyKey: string;
  name: string;
  element: string;
  imageUrl?: string;
  encountered: boolean;
  defeated: boolean;
  timesDefeated: number;
}
```

---

## Error Handling

All services follow consistent error handling:

```typescript
try {
  const result = await someService.doSomething();
  return result;
} catch (error) {
  console.error('Service error:', error);

  // Return user-friendly error
  throw new Error(
    'Something went wrong. Please try again later.'
  );
}
```

---

## Rate Limiting

### API Rate Limits

- **Pixazo API:** ~10 requests/minute (free tier)
- **Agent Service:** No limit (self-hosted)
- **SearXNG:** No limit (self-hosted)

### Mitigation Strategies

1. **Image Cache** - Never regenerate same image
2. **Debouncing** - Debounce user inputs
3. **Request Queuing** - Queue expensive operations
4. **Graceful Degradation** - Fallback to emojis if API fails

---

**Last Updated:** March 15, 2026
