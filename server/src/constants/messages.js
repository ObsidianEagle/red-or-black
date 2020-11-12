// Client -> Server
export const PLAYER_INIT = 'PLAYER_INIT' // { id }
export const RED_OR_BLACK_CHOICE = 'RED_OR_BLACK_CHOICE' // { choice }
export const RESTART_GAME = 'RESTART_GAME' // { }
export const KEEP_ALIVE = 'KEEP_ALIVE' // { }

// Server -> Client
export const PLAYER_INIT_ACK = 'PLAYER_INIT_ACK' // { id, gameState }
export const GAME_STATE = 'GAME_STATE' // { gameState }
export const SERVER_ERROR = 'SERVER_ERROR' // { errorMessage }
export const TIMEOUT_WARNING = 'TIMEOUT_WARNING' // { }
