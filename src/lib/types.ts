
// Types for our application

export interface ArticleData {
  title: string;
  content: string;
  url: string;
  siteName?: string;
  publishDate?: string;
  author?: string;
}

export interface AudioData {
  url: string;
  duration?: number;
}

export enum ProcessingStatus {
  IDLE = "idle",
  LOADING = "loading",
  EXTRACTING = "extracting",
  SUMMARIZING = "summarizing",
  CONVERTING = "converting",
  READY = "ready",
  ERROR = "error"
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

// Player state
export enum PlayerState {
  IDLE = "idle",
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  ERROR = "error"
}
