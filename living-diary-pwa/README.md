# Living Diary PWA 🌱

<div align="center">

**A gentle, empathetic personal assistant delivered as a Progressive Web App**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-green)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## ✨ Features

Living Diary PWA transforms personal growth into an engaging journey with an AI creature companion. Built with love, focusing on emotional wellbeing and gentle interaction.

### 🎮 Core Features

- **🌱 Creature Companion System**
  - Interactive creature creation with hatching sequence
  - AI-generated creature images (Pixazo API)
  - 5-stage evolution system (Egg → Hatchling → Companion → Friend → Partner)
  - Happiness tracking and emotional bonding
  - Automatic Pokemon-style evolution based on interaction

- **💬 Natural Chat Interface**
  - Real-time streaming AI responses
  - Mood picker for emotional tracking
  - Message history with timestamps
  - Gentle, empathetic conversation style
  - Voice message support (via Whisper)

- **⚔️ Battle System** ⭐ NEW
  - **Fully automatic battles** - no manual input needed
  - Floating damage numbers with animations
  - Critical hit effects and screen shakes
  - Sound effects (battle, hit, victory, defeat)
  - Smooth HP bar transitions
  - Victory/defeat celebrations
  - Mobile-responsive design

- **🗺️ World Building** ⭐ NEW
  - **5 unique biomes**: Verdant Forest, Crystal Depths, Ember Wastes, Fungal Hive, Void Rift
  - **45 zones** to explore (9 per biome)
  - **Dungeon crawler** with room-by-room gameplay
  - **Enemy bestiary** to track discoveries
  - **Inventory system** with equipment
  - **Crafting** with 20+ recipes
  - **Seasonal events** with special modifiers
  - **AI-generated art** for every game object (zones, enemies, items, bosses)

- **📋 Task Management**
  - Create, schedule, and complete tasks
  - Filter by today's tasks and pending tasks
  - Browser notifications for reminders
  - Task completion tracking

- **🌟 Skills & Quests**
  - Skill tree system for creature progression
  - Quest hub with objectives and rewards
  - Unlockable features as you progress

- **👥 Social Features**
  - Connect with other creatures
  - Social interactions and friendships

- **📅 Calendar**
  - View tasks by date
  - Schedule reminders
  - Track emotional patterns

- **🔮 Soul Viewer**
  - View your creature's essence
  - Cherished memories
  - Journey summary

### 🎨 PWA Capabilities

- ✅ **Offline-first** - IndexedDB storage for all data
- ✅ **Installable** - Add to home screen on mobile/desktop
- ✅ **Service Worker** - Instant loads with smart caching
- ✅ **Notifications** - Browser reminders for tasks
- ✅ **Responsive** - Mobile-first design that works everywhere
- ✅ **Fast** - Optimized performance with Vite

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Pixazo API key** (for creature image generation)
- **Agent Service** running on port 3001 (optional, for advanced features)

### Installation

```bash
# Clone the repository
git clone https://github.com/slothitude/living-diary-pwa.git
cd living-diary-pwa

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` with your API keys:

```env
# Agent Service (optional, for advanced AI features)
VITE_AGENT_SERVICE_URL=http://localhost:3001

# Pixazo API (required for creature images)
VITE_PIXAZO_API_KEY=your-api-key-here
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run check
```

Visit `http://localhost:5173` to see your Living Diary!

---

## 📚 Documentation

### User Guides

- [Getting Started Guide](#getting-started)
- [Creature Creation & Evolution](#creature-evolution)
- [Battle System Guide](#battle-system)
- [World Exploration](#world-exploration)
- [Task Management](#task-management)

### Developer Documentation

- [Architecture](ARCHITECTURE.md) - System design and patterns
- [API Documentation](API.md) - Service interfaces and endpoints
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

### Technical Documentation

- [Project Structure](#project-structure)
- [Key Technologies](#key-technologies)
- [State Management](#state-management)
- [Database Schema](#database-schema)

---

## 🏗️ Project Structure

```
living-diary-pwa/
├── src/
│   ├── components/          # React components
│   │   ├── Battle/         # Battle system (automatic, animations)
│   │   ├── Chat/           # Chat interface
│   │   ├── Creature/       # Creature components
│   │   ├── Menu/           # Navigation menu
│   │   ├── Quests/         # Quest system
│   │   ├── Skills/         # Skill tree
│   │   ├── Social/         # Social features
│   │   ├── Soul/           # Soul viewer
│   │   ├── Tasks/          # Task management
│   │   ├── World/          # World building (biomes, dungeons)
│   │   └── Calendar/       # Calendar view
│   ├── data/               # Static data (biomes, recipes, prompts)
│   ├── services/           # Business logic & API clients
│   ├── stores/             # Zustand state management
│   ├── styles/             # Global styles and animations
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # App entry point
├── public/                 # Static assets
├── docs/                   # Additional documentation
├── .env.example            # Environment variables template
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
└── package.json            # Dependencies and scripts
```

---

## 🔧 Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.6 |
| **Vite** | Build Tool & Dev Server | Latest |
| **TailwindCSS** | Styling | v4 |
| **Zustand** | State Management | Latest |
| **Dexie.js** | IndexedDB Wrapper | Latest |
| **date-fns** | Date Utilities | Latest |
| **vite-plugin-pwa** | PWA Support | Latest |
| **Pixazo API** | AI Image Generation | Flux Schnell |

---

## 💾 State Management

Living Diary uses **Zustand** for state management with separate stores:

```typescript
// Chat Store
interface ChatStore {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
}

// Creature Store
interface CreatureStore {
  creature: CreatureState | null;
  createCreature: (type: string, name: string) => Promise<void>;
  evolveCreature: () => Promise<void>;
}

// Discovery Store
interface DiscoveryStore {
  discoveredFeatures: Set<Feature>;
  discoverFeature: (feature: Feature) => void;
}

// Task Store
interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
}
```

---

## 🗄️ Database Schema

IndexedDB (via Dexie.js) stores:

```typescript
// Version 2 Schema
interface Tables {
  messages: ChatMessage;           // Chat history
  tasks: Task;                     // User tasks
  reminders: Reminder;             // Task reminders
  creatures: CreatureState;        // Creature data
  imageCache: CachedImage;         // Generated images
  worldZones: WorldZone;           // Discovered zones
  dungeons: Dungeon;               // Dungeon runs
  inventory: InventoryItem;        // Player items
  items: Item;                     // Item definitions
  worldEvents: WorldEvent;         // Seasonal events
  bestiary: BestiaryEntry;         // Discovered enemies
}
```

---

## 🎯 Getting Started

### First Visit: Creature Creation

1. **Welcome Screen** - See a mysterious egg
2. **Choose Type** - Pick any creature type (cat, dragon, fish, anything!)
3. **Name Your Creature** - Give it a special name
4. **Watch It Hatch** - Beautiful hatching animation
5. **AI Generates Image** - Unique creature portrait created

### Daily Usage

| Feature | Description | Unlock Level |
|---------|-------------|--------------|
| 💬 Chat | Journal naturally, set mood | Level 1 |
| ⚔️ Battle | Auto-battles with animations | Level 5 |
| 🌟 Skills | Skill tree progression | Level 10 |
| 📜 Quests | Quest objectives and rewards | Level 15 |
| 🗺️ World | Explore biomes and dungeons | Level 25 |
| 👥 Social | Connect with others | Level 20 |
| 📅 Calendar | View tasks by date | Level 1 |

### Creature Evolution

| Interactions | Stage | Image Size | Description |
|--------------|-------|------------|-------------|
| 0 | Egg | 512×512 | Mysterious beginning |
| 5 | Hatchling | 640×640 | Just born, curious |
| 15 | Companion | 768×768 | Developing personality |
| 30 | Friend | 896×896 | Deeply bonded |
| 50 | Legendary | 1024×1024 | Maximum power, divine wisdom |

---

## ⚔️ Battle System

### Fully Automatic Battles

Battles run automatically with stunning visual feedback:

- ✨ **Automatic Combat** - No manual input needed
- 🎨 **Creature Portraits** - AI-generated enemy images
- 💥 **Damage Numbers** - Floating numbers with animations
- ⚡ **Critical Hits** - Golden numbers with flash effects
- 🔊 **Sound Effects** - Battle, hit, victory, defeat sounds
- 📊 **HP Bars** - Smooth 0.5s transitions
- 🎉 **Celebrations** - Victory bounce and defeat animations

### Battle Flow

```
Enter Battle → 1.5s Delay → Auto-Battle Begins
                             ↓
                      Attacks & Damage
                             ↓
                 Animations & Sounds
                             ↓
                    Victory/Defeat
```

---

## 🗺️ World Building

### Biomes & Zones

| Biome | Zones | Unlock Level | Theme |
|-------|-------|--------------|-------|
| 🌲 Verdant Forest | 9 | Level 1 | Nature, growth |
| 💎 Crystal Depths | 9 | Level 5 | Ice, crystals |
| 🔥 Ember Wastes | 9 | Level 10 | Fire, volcanic |
| 🍄 Fungal Hive | 9 | Level 15 | Alien, organic |
| 🌀 Void Rift | 9 | Level 20 | Space, mystery |

### Dungeon Crawler

- **Room-by-room** gameplay
- **Fight / Sneak / Flee** options
- **Loot drops** with rarity tiers
- **Boss battles** at room 5
- **Score tracking** and high scores

### Crafting & Inventory

- **20+ recipes** across all biomes
- **Equip items**: weapon, armor, accessory
- **Rarity system**: Common, Rare, Legendary
- **AI-generated art** for unique items

### Seasonal Events

| Event | Season | Bonus |
|-------|--------|-------|
| 🌸 Spring Bloom | Mar-May | +50% Verdant drops |
| ☀️ Summer Blaze | Jun-Aug | Ember Wastes early unlock |
| ❄️ Crystal Winter | Dec-Jan | +100% rare drops |
| 🎃 Void Harvest | Oct | Exclusive loot |
| 🍄 Fungal Awakening | Aug-Sep | +100% Fungal drops |

---

## 🔐 Environment Variables

```env
# Agent Service (Optional - for advanced AI features)
VITE_AGENT_SERVICE_URL=http://localhost:3001

# Pixazo API (Required - for creature/enemy/item images)
VITE_PIXAZO_API_KEY=your-api-key-here

# SearXNG Search (Optional - for web search)
VITE_SEARXNG_URL=http://localhost:8888
```

---

## 🧪 Testing

```bash
# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview

# Run development server
npm run dev
```

---

## 🚢 Deployment

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Quick Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run check`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📝 License

This project is part of the Living Diary project - a gift for personal growth and self-care.

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **AI Models** - Powered by ZAI GLM-5 and Pixazo (Flux Schnell)
- **Inspiration** - Built with love for emotional wellbeing
- **Community** - Thank you to all contributors and users

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/slothitude/living-diary-pwa/issues)
- **Discussions**: [GitHub Discussions](https://github.com/slothitude/living-diary-pwa/discussions)
- **Email**: support@slothitudegames.com

---

<div align="center">

**Built with love and TypeScript 💚**

[⬆ Back to Top](#living-diary-pwa-)

</div>
