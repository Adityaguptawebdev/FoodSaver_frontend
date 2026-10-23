const STORAGE_KEY = "foodsaver_notification_sound";

let audioContext = null;

// Per-device preference; storage can be unavailable (private mode, blocked site data), so default to on.
export function isNotificationSoundOn() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setNotificationSoundOn(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Preference just won't persist across reloads.
  }
}

// Browsers block audio until the user has interacted with the page, so the context is
// created (or resumed) from a click/keypress and reused for every chime after that.
export function unlockNotificationSound() {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume();
  } catch {
    // No Web Audio support: alerts stay silent.
  }
}

// A short two-note chime synthesized on the fly, so there's no audio file to ship.
export function playNotificationSound() {
  if (!audioContext || audioContext.state !== "running" || !isNotificationSoundOn()) return;

  const now = audioContext.currentTime;
  [
    [880, 0], // A5
    [1174.66, 0.13], // D6
  ].forEach(([frequency, offset]) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.2, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.6);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.65);
  });
}
