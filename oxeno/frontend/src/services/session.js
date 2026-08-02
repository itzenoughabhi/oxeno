const sessionKey = "oxeno_session";

function readSession(storage) {
  try {
    const value = storage.getItem(sessionKey);
    return value ? JSON.parse(value) : null;
  } catch {
    storage.removeItem(sessionKey);
    return null;
  }
}

export function getStoredSession() {
  return readSession(localStorage) || readSession(sessionStorage);
}

export function saveSession(account, remember = false) {
  const session = {
    user: account.user,
    business: account.business,
  };
  const targetStorage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem(sessionKey);
  targetStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(sessionKey);
  sessionStorage.removeItem(sessionKey);
}
