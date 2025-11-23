# 🎲 Scrum Poker: Where Estimates Meet Fun! ✨

> _Because pointing poker should be as exciting as playing poker!_ 🃏

A real-time collaborative estimation tool that transforms your sprint planning from mundane meetings into engaging team experiences. Watch your team gather around a virtual poker table, cast votes with style, and celebrate consensus with flying emojis! 🚀

## 🌟 What Makes This Special?

### 🎯 **The Perfect Planning Experience**

- **Real-time Fibonacci Voting** - Because 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, and "?" are all you need
- **Anonymous Voting Phase** - No peeking until everyone's in! 👀
- **Dramatic Vote Reveals** - Watch the cards flip simultaneously for maximum impact
- **Live Statistics** - Averages, distributions, and consensus metrics in real-time

### 🎉 **Interactive Fun Features**

- **Flying Emoji Reactions** - Throw emojis at teammates' cards with smooth animations
- **Themed Avatars** - From puppies 🐶 to dragons 🐉, everyone gets a fun persona
- **Responsive Poker Table** - Beautifully arranged user cards that adapt to any screen size
- **Real-time Updates** - See votes, reactions, and changes instantly across all devices

### 🛠 **Professional Under the Hood**

- **Modern Tech Stack** - React, TypeScript, Socket.IO, and Tailwind CSS
- **Robust Architecture** - Handles disconnections, reconnections, and room persistence
- **Mobile-First Design** - Looks stunning on phones, tablets, and desktops
- **Production Ready** - Deployed on Azure with proper CORS and security

## 🚀 Quick Start

### Get Rolling in 3 Steps!

1. **Clone & Install**

   ```bash
   git clone <your-repo>
   cd scrum-poker
   npm install
   ```

2. **Fire Up the Engines**

   ```bash
   # Option 1: Run everything at once (recommended)
   npm run dev:full

   # Option 2: Run separately
   npm run dev        # Frontend (http://localhost:5173)
   cd server && npm start  # Backend (http://localhost:8080)
   ```

3. **Start Planning!**
   - Open `http://localhost:5173`
   - Create a room or join with a 6-letter code
   - Invite your team and start estimating! 🎊

## 🏗 Architecture Deep Dive

```
🏠 Project Structure
├── 🎨 src/
│   ├── components/
│   │   ├── voting/        # Poker table, cards, and voting logic
│   │   ├── reactions/     # Flying emoji system
│   │   ├── room/          # Room creation and joining
│   │   └── ui/            # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   └── pages/             # Main application pages
└── 🚪 server/
    └── server.js          # Express + Socket.IO backend
```

### 🧠 **Tech Stack Highlights**

**Frontend Powerhouse:**

- **React 19** with modern hooks and context
- **TypeScript** for bulletproof type safety
- **Vite** for lightning-fast development
- **Tailwind CSS v4** for beautiful, maintainable styles

**Backend Reliability:**

- **Node.js + Express** for robust API handling
- **Socket.IO** for real-time magic ✨
- **In-memory rooms** with smart cleanup and reconnection
- **CORS configured** for seamless development and production

## 🎮 How to Play

### 🏡 **Room Management**

1. **Create a Room** - Pick a team name, get a unique 6-letter code
2. **Share the Code** - Send it to your teammates (supports up to 10 players!)
3. **Join Instantly** - No accounts needed, just pick a username

### 🗳 **The Voting Experience**

1. **Pick Your Card** - Click a Fibonacci number that represents your estimate
2. **Watch the Magic** - See anonymous vote indicators around the table
3. **Reveal Together** - Once everyone votes, dramatically reveal all estimates
4. **Analyze & Discuss** - View statistics, averages, and consensus data

### 🎯 **Advanced Features**

- **Flying Emojis** - Click any teammate's card to throw celebratory emojis! 🎉
- **Vote Adjustments** - Change your mind after reveals? No problem!
- **Smart Reconnection** - Page refresh? You'll be back in the room instantly
- **Mobile Optimized** - Estimate on-the-go with full mobile support

## 🛠 Development Commands

```bash
# 🚀 Development
npm run dev:full      # Run both frontend and backend
npm run dev           # Frontend only
npm run check         # Type-check + lint + format

# 🔍 Quality Assurance
npm run type-check    # TypeScript validation
npm run lint          # ESLint checking
npm run format        # Prettier formatting

# 📦 Production
npm run build         # Build for production
npm run preview       # Preview production build
```

## 🎨 Customization Ideas

Want to make it your own? Here are some fun extensions:

- **Custom Voting Scales** - T-shirt sizes, powers of 2, or your own scale
- **Team Themes** - Company colors, custom avatars, or branded styling
- **Integration Hooks** - Connect with Jira, Azure DevOps, or your planning tools
- **Advanced Analytics** - Historical data, team velocity tracking, or estimation accuracy

## 🌍 Deployment

Ready for production? Check out `AZURE_DEPLOYMENT.md` for step-by-step Azure deployment, or adapt for your favorite hosting platform!

## 🤝 Contributing

Found a bug? Have a cool feature idea? Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with a description

---

## 📄 Copyright

© 2025 Mojo Studio. All rights reserved.

---

_Happy estimating! May your stories be well-pointed and your sprints be successful!_ 🎯✨
