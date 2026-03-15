# Changelog

All notable changes to Living Diary PWA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Voice input integration (Whisper API)
- Push notification scheduling
- Cloud backup/restore
- Real-time multiplayer battles
- Performance analytics dashboard

---

## [1.0.0] - 2026-03-15

### Added

#### 🎮 Battle System
- **Automatic battle mode** - Battles run completely automatically without user input
- **Floating damage numbers** - Pokemon-style damage display with animations
- **Critical hit effects** - Golden numbers with screen flash
- **Sound effects** - Battle, hit, victory, defeat sounds
- **Smooth HP bar transitions** - 0.5s ease-out animations
- **Victory/defeat celebrations** - Bounce and fade animations
- **Creature portraits** - Display AI-generated enemy images in battle
- **Descriptive battle log** - Color-coded battle text with formatting
- **Mobile-responsive design** - Stacked layout on mobile devices

#### 🗺️ World Building
- **5 unique biomes**:
  - Verdant Forest (Nature, growth)
  - Crystal Depths (Ice, crystals)
  - Ember Wastes (Fire, volcanic)
  - Fungal Hive (Alien, organic)
  - Void Rift (Space, mystery)
- **45 explorable zones** - 9 zones per biome with progressive unlocking
- **Dungeon crawler** - Room-by-room gameplay with:
  - Fight / Sneak / Flee options
  - 5-room dungeons with boss battles
  - Loot drops with rarity tiers
  - Score tracking and high scores
- **Enemy bestiary** - Track discovered and defeated enemies
- **Inventory system** - Equip weapons, armor, accessories
- **Crafting system** - 20+ recipes across all biomes
- **Seasonal events**:
  - Spring Bloom (Mar-May)
  - Summer Blaze (Jun-Aug)
  - Crystal Winter (Dec-Jan)
  - Void Harvest (Oct)
  - Fungal Awakening (Aug-Sep)
- **AI-generated art** - Unique images for zones, enemies, items, bosses, events

#### 🌱 Creature System
- **Creature creation** with hatching sequence
- **5-stage evolution system**:
  - Egg (0 interactions)
  - Hatchling (5 interactions)
  - Companion (15 interactions)
  - Friend (30 interactions)
  - Partner/Legendary (50 interactions)
- **Automatic evolution** - Creature grows based on interaction count
- **Happiness tracking** - Emotional bonding system
- **AI-generated portraits** - Unique creature images (512-1024px)

#### 💬 Chat Interface
- **Real-time streaming AI responses**
- **Mood picker** for emotional tracking
- **Message history** with timestamps
- **Gentle, empathetic conversation style**
- **Infinite memory** - Remembers everything forever

#### 📋 Task Management
- **Create, schedule, and complete tasks**
- **Filter by today's tasks and pending tasks**
- **Browser notifications** for reminders
- **Task completion tracking**

#### 🌟 Skills & Quests
- **Skill tree** for creature progression
- **Quest hub** with objectives and rewards
- **Progressive feature unlocking** based on creature level

#### 👥 Social Features
- **Connect with other creatures**
- **Social interactions** and friendships

#### 📅 Calendar
- **View tasks by date**
- **Schedule reminders**
- **Track emotional patterns**

#### 🔮 Soul Viewer
- **View creature's essence**
- **Cherished memories**
- **Journey summary**

#### 🎨 PWA Capabilities
- **Offline-first** - IndexedDB storage for all data
- **Installable** - Add to home screen
- **Service Worker** - Smart caching
- **Browser Notifications** - Task reminders
- **Responsive Design** - Mobile-first approach
- **Fast** - Vite-powered dev server

#### 📚 Documentation
- **Comprehensive README** - Features, setup, guides
- **Architecture documentation** - System design and patterns
- **API documentation** - Service interfaces
- **Deployment guide** - Platform-specific instructions
- **Contributing guide** - Development workflow

### Technical Stack
- **React 18** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS v4** - Styling
- **Zustand** - State management
- **Dexie.js** - IndexedDB wrapper
- **date-fns** - Date utilities
- **vite-plugin-pwa** - PWA support

### Database Schema (IndexedDB)
- `messages` - Chat history
- `tasks` - User tasks
- `reminders` - Task reminders
- `creatures` - Creature data
- `imageCache` - Generated images
- `worldZones` - Discovered zones
- `dungeons` - Dungeon runs
- `inventory` - Player items
- `items` - Item definitions
- `worldEvents` - Seasonal events
- `bestiary` - Discovered enemies

---

## [0.1.0] - 2026-03-10

### Added
- Initial project setup
- Basic creature creation
- Simple chat interface
- Task management
- PWA configuration

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-03-15 | Initial stable release with all core features |
| 0.1.0 | 2026-03-10 | Initial development version |

---

## Links

- [GitHub Repository](https://github.com/slothitude/living-diary-pwa)
- [Issue Tracker](https://github.com/slothitude/living-diary-pwa/issues)
- [Documentation](https://github.com/slothitude/living-diary-pwa/blob/main/README.md)

---

**Note:** This project follows semantic versioning. For versions before 1.0.0, minor version increments represent breaking changes, and patch version increments represent backward-compatible bug fixes.

---

**Last Updated:** March 15, 2026
