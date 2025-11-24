// Avatar theme interface
export interface AvatarTheme {
  emoji: string;
  color: string;
  name: string;
}

// Core interfaces
export interface User {
  id: string;
  name: string;
  avatar: AvatarTheme | string; // Support both new and legacy formats
  connected: boolean;
  isSpectator?: boolean; // Spectators can observe but not vote
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  votingState: 'voting' | 'revealed';
  votes: Record<string, VoteValue>;
  createdAt: Date;
}

export interface RoomState {
  room: Room | null;
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// Voting types
export type VoteValue =
  | 0
  | 1
  | 2
  | 3
  | 5
  | 8
  | 13
  | 21
  | 34
  | 55
  | 89
  | '?'
  | 'REMOVE_VOTE'
  | null;

export interface Vote {
  userId: string;
  userName: string;
  avatar: string;
  vote: VoteValue;
}

export interface VoteStats {
  average: number;
  distribution: Record<string, number>;
  agreement: number;
  totalVotes: number;
}

export interface VotingState {
  votes: Record<string, VoteValue>;
  currentUserVote: VoteValue;
  votingState: 'voting' | 'revealed';
  stats: VoteStats | null;
}

// API interfaces
export interface CreateUserRequest {
  userName: string;
  roomCode: string;
}

export interface CreateUserResponse {
  user: User;
  room: {
    id: string;
    name: string;
    users: User[];
    votingState: 'voting' | 'revealed';
  };
}

// Event types
export type EventType =
  | 'user-joined'
  | 'user-left'
  | 'vote-cast'
  | 'votes-revealed'
  | 'voting-reset'
  | 'emoji-flying'
  | 'self-emoji';

export interface BaseEvent {
  type: EventType;
  roomCode: string;
  timestamp: string;
}

export interface UserJoinedEvent extends BaseEvent {
  type: 'user-joined';
  data: {
    user: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

export interface UserLeftEvent extends BaseEvent {
  type: 'user-left';
  data: {
    userId: string;
    userName: string;
  };
}

export interface VoteCastEvent extends BaseEvent {
  type: 'vote-cast';
  data: {
    userId: string;
    hasVoted: boolean;
    totalVotes: number;
    totalUsers: number;
  };
}

export interface VotesRevealedEvent extends BaseEvent {
  type: 'votes-revealed';
  data: {
    votes: Array<{
      userId: string;
      userName: string;
      avatar: string;
      vote: number | null;
    }>;
    stats: {
      average: number;
      distribution: Record<string, number>;
      agreement: number;
      totalVotes: number;
    };
  };
}

export interface VotingResetEvent extends BaseEvent {
  type: 'voting-reset';
  data: {
    newIssue: string;
  };
}

export interface EmojiFlyingEvent extends BaseEvent {
  type: 'emoji-flying';
  data: {
    flyingEmoji: {
      id: string;
      emoji: string;
      toUser: User;
      timestamp: string;
    };
  };
}

export interface SelfEmojiEvent extends BaseEvent {
  type: 'self-emoji';
  data: {
    userId: string;
    emoji: string;
    timestamp: string;
  };
}

export type ScrumPokerEvent =
  | UserJoinedEvent
  | UserLeftEvent
  | VoteCastEvent
  | VotesRevealedEvent
  | VotingResetEvent
  | EmojiFlyingEvent
  | SelfEmojiEvent;

// Generic SSE event for simple handling
export interface GenericSSEEvent {
  type: string;
  data?: {
    room?: Room;
    userId?: string;
    vote?: number | null;
    user?: { id: string; name: string };
    timestamp?: string;
    [key: string]: unknown;
  };
}
