const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-domain.azurewebsites.net'] // Replace with your Azure domain
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
          ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-domain.azurewebsites.net'] // Replace with your Azure domain
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
          ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory storage (replace with database in production)
const rooms = new Map();
const users = new Map();

// Utility functions
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateAvatar(usedEmojis = []) {
  const themes = [
    // Animals
    { emoji: '🐶', color: 'bg-amber-200', name: 'Puppy' },
    { emoji: '🐱', color: 'bg-orange-200', name: 'Kitty' },
    { emoji: '🐸', color: 'bg-green-200', name: 'Frog' },
    { emoji: '🐼', color: 'bg-gray-300', name: 'Panda' },
    { emoji: '🦊', color: 'bg-orange-300', name: 'Fox' },
    { emoji: '🐺', color: 'bg-gray-400', name: 'Wolf' },
    { emoji: '🐨', color: 'bg-gray-300', name: 'Koala' },
    { emoji: '🦁', color: 'bg-yellow-300', name: 'Lion' },

    // Fantasy
    { emoji: '🦄', color: 'bg-purple-200', name: 'Unicorn' },
    { emoji: '🐉', color: 'bg-red-200', name: 'Dragon' },
    { emoji: '🧙‍♂️', color: 'bg-indigo-300', name: 'Wizard' },
    { emoji: '🧚‍♀️', color: 'bg-pink-200', name: 'Fairy' },

    // Fun Characters
    { emoji: '🤖', color: 'bg-blue-200', name: 'Robot' },
    { emoji: '👾', color: 'bg-purple-300', name: 'Alien' },
    { emoji: '🎭', color: 'bg-red-200', name: 'Actor' },
    { emoji: '🎪', color: 'bg-yellow-200', name: 'Circus' },

    // Food Friends
    { emoji: '🍕', color: 'bg-orange-200', name: 'Pizza' },
    { emoji: '🍔', color: 'bg-yellow-300', name: 'Burger' },
    { emoji: '🍩', color: 'bg-pink-200', name: 'Donut' },
    { emoji: '🌮', color: 'bg-orange-300', name: 'Taco' },

    // Ocean
    { emoji: '🐙', color: 'bg-purple-200', name: 'Octopus' },
    { emoji: '🐠', color: 'bg-blue-200', name: 'Fish' },
    { emoji: '🦈', color: 'bg-gray-300', name: 'Shark' },
    { emoji: '🐳', color: 'bg-blue-300', name: 'Whale' },
  ];

  // Filter out already used emojis
  const availableThemes = themes.filter(
    (theme) => !usedEmojis.includes(theme.emoji)
  );

  // If all emojis are used (very unlikely with 24 avatars), fallback to all themes
  const themesToUse = availableThemes.length > 0 ? availableThemes : themes;

  const randomIndex = Math.floor(Math.random() * themesToUse.length);
  return themesToUse[randomIndex];
}

// API Routes
app.post('/api/create-room', (req, res) => {
  const { teamName } = req.body;

  if (!teamName || !teamName.trim()) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  const roomCode = generateRoomCode();
  const room = {
    id: roomCode,
    name: teamName.trim(),
    users: [],
    votingState: 'voting', // 'voting' | 'revealed'
    votes: {},
    createdAt: new Date().toISOString(),
  };

  rooms.set(roomCode, room);
  console.log('Created room:', roomCode);

  res.json({ roomCode });
});

app.post('/api/join-room', (req, res) => {
  const { roomCode, userName } = req.body;

  if (!roomCode || !userName) {
    return res
      .status(400)
      .json({ error: 'Room code and user name are required' });
  }

  const sanitizedName = userName.trim().slice(0, 20);
  if (sanitizedName.length === 0) {
    return res.status(400).json({ error: 'Valid user name is required' });
  }

  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Check room capacity
  if (room.users.length >= 10) {
    return res.status(429).json({ error: 'Room is full' });
  }

  // Check for duplicate names
  const existingUser = room.users.find(
    (u) => u.name.toLowerCase() === sanitizedName.toLowerCase()
  );
  if (existingUser) {
    return res.status(409).json({
      error: `The name "${sanitizedName}" is already taken. Please choose a different name.`,
    });
  }

  // Get already used emojis in this room
  const usedEmojis = room.users.map((user) => user.avatar.emoji);

  // Create new user (users are removed completely on disconnect)
  const user = {
    id: uuidv4(),
    name: sanitizedName,
    avatar: generateAvatar(usedEmojis),
    connected: true,
  };

  room.users.push(user);
  console.log('User joined:', sanitizedName, 'to room:', roomCode);

  res.json({
    user,
    room: {
      id: room.id,
      name: room.name,
      users: room.users,
      votingState: room.votingState,
      votes: room.votes,
    },
  });
});

app.post('/api/cast-vote', (req, res) => {
  const { roomCode, userId, vote } = req.body;

  if (!roomCode || !userId || vote === undefined) {
    return res
      .status(400)
      .json({ error: 'Room code, user ID, and vote are required' });
  }

  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const user = room.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Handle vote removal vs "?" vote
  if (vote === 'REMOVE_VOTE') {
    delete room.votes[userId];
  } else {
    // Store the vote (including "?" votes)
    room.votes[userId] = vote;
  }

  // Send personalized updates to each user in the room
  room.users.forEach((roomUser) => {
    const userSockets = Array.from(io.sockets.sockets.values()).filter(
      (s) => s.userId === roomUser.id && s.roomCode === roomCode.toUpperCase()
    );

    userSockets.forEach((socket) => {
      // Create personalized votes object
      const personalizedVotes = {};
      if (room.votingState === 'revealed') {
        // During reveal phase, send actual votes to everyone
        Object.assign(personalizedVotes, room.votes);
      } else {
        // During voting phase, show user's own vote but anonymize others
        Object.keys(room.votes).forEach((id) => {
          if (id === roomUser.id) {
            personalizedVotes[id] = room.votes[id]; // Show own vote
          } else {
            personalizedVotes[id] = '***'; // Hide other votes
          }
        });
      }

      socket.emit('vote-cast', {
        user,
        vote: roomUser.id === userId ? vote : vote === null ? null : '***',
        room: {
          id: room.id,
          name: room.name,
          users: room.users,
          votingState: room.votingState,
          votes: personalizedVotes,
        },
      });
    });
  });

  res.json({ success: true });
});

app.post('/api/reveal-votes', (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).json({ error: 'Room code is required' });
  }

  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  room.votingState = 'revealed';

  // Calculate voting statistics
  const votes = Object.values(room.votes);
  const stats = {
    totalVotes: votes.length,
    average:
      votes.length > 0
        ? (votes.reduce((a, b) => a + Number(b), 0) / votes.length).toFixed(1)
        : 0,
    distribution: votes.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {}),
  };

  // Emit to all users in the room
  io.to(roomCode.toUpperCase()).emit('votes-revealed', {
    room: {
      id: room.id,
      name: room.name,
      users: room.users,
      votingState: room.votingState,
      votes: room.votes,
    },
    stats,
  });

  res.json({ stats });
});

app.post('/api/reset-votes', (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).json({ error: 'Room code is required' });
  }

  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  room.votes = {};
  room.votingState = 'voting';

  // Emit to all users in the room
  io.to(roomCode.toUpperCase()).emit('voting-reset', {
    room: {
      id: room.id,
      name: room.name,
      users: room.users,
      votingState: room.votingState,
      votes: room.votes,
    },
  });

  res.json({ success: true });
});

app.get('/api/room/:roomCode', (req, res) => {
  const { roomCode } = req.params;

  if (!roomCode) {
    return res.status(400).json({ error: 'Room code is required' });
  }

  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    room: {
      id: room.id,
      name: room.name,
      users: room.users,
      votingState: room.votingState,
      votes: room.votes,
    },
  });
});

app.post('/api/throw-emoji', (req, res) => {
  const { roomCode, fromUserId, toUserId, emoji } = req.body;

  if (!roomCode || !fromUserId || !toUserId || !emoji) {
    return res.status(400).json({
      error: 'Room code, from user ID, to user ID, and emoji are required',
    });
  }

  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const fromUser = room.users.find((u) => u.id === fromUserId);
  if (!fromUser) {
    return res.status(404).json({ error: 'From user not found' });
  }

  const toUser = room.users.find((u) => u.id === toUserId);
  if (!toUser) {
    return res.status(404).json({ error: 'To user not found' });
  }

  const flyingEmoji = {
    id: uuidv4(),
    emoji,
    toUser: {
      id: toUser.id,
      name: toUser.name,
      avatar: toUser.avatar,
    },
    timestamp: new Date().toISOString(),
  };

  // Emit to all users in the room
  io.to(roomCode.toUpperCase()).emit('emoji-flying', { flyingEmoji });

  res.json({ success: true });
});

app.post('/api/self-emoji', (req, res) => {
  const { roomCode, userId, emoji } = req.body;

  if (!roomCode || !userId || !emoji) {
    return res.status(400).json({
      error: 'Room code, user ID, and emoji are required',
    });
  }

  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const user = room.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Emit to all users in the room (including the sender)
  io.to(roomCode.toUpperCase()).emit('self-emoji', {
    userId,
    emoji,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomCode, userId } = data;

    if (!roomCode) {
      socket.emit('error', { message: 'Room code is required' });
      return;
    }

    const room = rooms.get(roomCode.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Join the room
    socket.join(roomCode.toUpperCase());

    // Store user info on socket for cleanup
    socket.roomCode = roomCode.toUpperCase();
    socket.userId = userId;

    // Check if user is reconnecting
    const user = room.users.find((u) => u.id === userId);
    if (user) {
      // User is reconnecting, mark them as connected
      user.connected = true;
      console.log(
        `User ${userId} reconnected to room ${roomCode.toUpperCase()}`
      );

      // Notify others that user reconnected
      socket.to(roomCode.toUpperCase()).emit('user-joined', {
        user,
        room: {
          id: room.id,
          name: room.name,
          users: room.users,
          votingState: room.votingState,
          votes: room.votes,
        },
      });
    }

    console.log(`User ${userId} joined room ${roomCode.toUpperCase()}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (socket.roomCode && socket.userId) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        const userIndex = room.users.findIndex((u) => u.id === socket.userId);
        if (userIndex > -1) {
          const user = room.users[userIndex];

          // Mark user as disconnected but don't remove immediately
          // This allows for page refreshes without losing data
          user.connected = false;

          // Set a timeout to remove the user if they don't reconnect
          setTimeout(() => {
            const currentRoom = rooms.get(socket.roomCode);
            if (currentRoom) {
              const currentUserIndex = currentRoom.users.findIndex(
                (u) => u.id === socket.userId
              );
              if (
                currentUserIndex > -1 &&
                !currentRoom.users[currentUserIndex].connected
              ) {
                // User didn't reconnect, remove them completely
                const userToRemove = currentRoom.users[currentUserIndex];
                currentRoom.users.splice(currentUserIndex, 1);
                delete currentRoom.votes[socket.userId];

                // Notify others that user left
                socket.to(socket.roomCode).emit('user-left', {
                  user: userToRemove,
                  room: {
                    id: currentRoom.id,
                    name: currentRoom.name,
                    users: currentRoom.users,
                    votingState: currentRoom.votingState,
                    votes: currentRoom.votes,
                  },
                });
              }
            }
          }, 10000); // 10 second grace period for reconnection
        }
      }
    }
  });
});

// Serve React app for all other routes (SPA support) - only in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Route not found in development mode' });
  });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
