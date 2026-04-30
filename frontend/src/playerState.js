const PLAYER_STATE_KEY = "playerState";
const AUDIO_STATE_KEY = "audioState";

const defaultPlayerState = {
  track: null,
  isPlaying: false,
  showPopup: false,
  queue: [],
  currentIndex: 0,
  shuffle: false,
  repeatMode: "off",
};

const defaultAudioState = {
  currentTime: 0,
  duration: 0,
  ready: false,
  sourceUrl: "",
};

function readJsonFromSessionStorage(key, fallback) {
  const raw = sessionStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function persistState(key, nextState, eventName) {
  sessionStorage.setItem(key, JSON.stringify(nextState));
  window.dispatchEvent(new Event(eventName));
  return nextState;
}

export function getPlayableUrl(track) {
  return track?.audioUrl || track?.previewUrl || "";
}

export function formatTime(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function readPlayerState() {
  const state = readJsonFromSessionStorage(PLAYER_STATE_KEY, defaultPlayerState);

  return {
    ...defaultPlayerState,
    ...state,
    queue: Array.isArray(state.queue) ? state.queue : [],
    currentIndex: Number.isFinite(Number(state.currentIndex)) ? Number(state.currentIndex) : 0,
    shuffle: Boolean(state.shuffle),
    repeatMode: ["off", "all", "one"].includes(state.repeatMode) ? state.repeatMode : "off",
  };
}

export function writePlayerState(patch) {
  return persistState(PLAYER_STATE_KEY, { ...readPlayerState(), ...patch }, "player-state-changed");
}

export function readAudioState() {
  const state = readJsonFromSessionStorage(AUDIO_STATE_KEY, defaultAudioState);

  return {
    ...defaultAudioState,
    ...state,
    currentTime: Number.isFinite(Number(state.currentTime)) ? Number(state.currentTime) : 0,
    duration: Number.isFinite(Number(state.duration)) ? Number(state.duration) : 0,
    ready: Boolean(state.ready),
  };
}

export function writeAudioState(patch) {
  return persistState(AUDIO_STATE_KEY, { ...readAudioState(), ...patch }, "audio-state-changed");
}

export function getNextTrack(queue, currentIndex, shuffle = false) {
  if (!Array.isArray(queue) || queue.length === 0) {
    return { track: null, index: 0 };
  }

  if (shuffle && queue.length > 1) {
    const candidates = queue.map((track, index) => ({ track, index })).filter((item) => item.index !== currentIndex);
    const choice = candidates[Math.floor(Math.random() * candidates.length)] || { track: queue[currentIndex], index: currentIndex };
    return choice;
  }

  const nextIndex = (currentIndex + 1) % queue.length;
  return { track: queue[nextIndex], index: nextIndex };
}

export function getPreviousTrack(queue, currentIndex) {
  if (!Array.isArray(queue) || queue.length === 0) {
    return { track: null, index: 0 };
  }

  const nextIndex = (currentIndex - 1 + queue.length) % queue.length;
  return { track: queue[nextIndex], index: nextIndex };
}

export function announcePlayerCommand(detail) {
  window.dispatchEvent(new CustomEvent("tuneon:player-command", { detail }));
}
