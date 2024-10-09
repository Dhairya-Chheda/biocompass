// backend/sessionState.js
const sessionStateMap = new Map();

export function storeSessionState(requestState, sessionState) {
  sessionStateMap.set(requestState, sessionState);
}

export function getSessionState(requestState) {
  return sessionStateMap.get(requestState);
}
