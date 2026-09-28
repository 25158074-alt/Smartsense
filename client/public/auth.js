(function () {
  'use strict';
  const USERS_KEY = 'smartsense_users_v2';
  const SESSION_KEY = 'smartsense_session_v2';
  const legacy = ['smartsense_user_name','smartsense_user_email','smartsense_user_role','smartsense_user_desk','smartsense_user_floor'];

  function readUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch (_) { return {}; }
  }
  function writeUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  function slug(value) { return String(value || '').trim().toLowerCase(); }
  function initials(name) { return String(name || 'User').split(/\s+/).filter(Boolean).slice(0,2).map(p => p[0].toUpperCase()).join('') || 'U'; }
  function hash(text) { let h = 0; for (let i=0;i<text.length;i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0; return Math.abs(h); }
  function generatedProfile(email, name) {
    const h = hash(email);
    const floors = ['3rd Floor','4th Floor','2nd Floor','5th Floor'];
    const zones = ['Zone 2','Zone 1','Zone 3','Zone 4'];
    const roles = ['Design team','Operations team','Research team','Product team'];
    return {
      email, name: name || email.split('@')[0].split(/[._-]+/).map(w => w ? w[0].toUpperCase()+w.slice(1) : '').join(' ') || 'SmartSense User',
      role: `${zones[h % zones.length]} · ${roles[h % roles.length]}`,
      desk: `${zones[h % zones.length]} · ${String.fromCharCode(65 + (h % 4))}-${String(10 + (h % 28)).padStart(2,'0')}`,
      floor: floors[h % floors.length], employeeId: `EMP-${1000 + (h % 8999)}`, points: 1450 + (h % 1800), streak: 3 + (h % 8), score: 76 + (h % 19), preferences: { dailyTips:true, weeklySummary:true, rewardAlerts:false, roomBooking:true }, createdAt: new Date().toISOString()
    };
  }
  function getUser(email) { return readUsers()[slug(email)] || null; }
  function saveUser(user) { const users = readUsers(); users[slug(user.email)] = user; writeUsers(users); return user; }
  function setSession(email) { localStorage.setItem(SESSION_KEY, slug(email)); }
  function current() {
    const email = localStorage.getItem(SESSION_KEY);
    return email ? getUser(email) : null;
  }
  // Persists edits (name/role/desk/floor/points/etc.) onto the logged-in
  // user's actual profile record, then re-syncs the legacy mirror keys.
  // Anything that changes profile fields must go through this — writing
  // straight to the legacy keys does NOT update the record `current()`
  // reads from, so those edits would silently be lost on next render/reload.
  function updateCurrentUser(patch) {
    const user = current();
    if (!user) return null;
    Object.assign(user, patch || {});
    saveUser(user);
    syncLegacy();
    return user;
  }
  function login(email, password, name, isSignup) {
    email = slug(email);
    if (!email || !email.includes('@')) throw new Error('Enter a valid email address.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
    const existing = getUser(email);
    let created = null;
    if (isSignup && existing) throw new Error('An account already exists for this email. Log in instead.');
    if (!existing) {
      // Create a profile for both sign-up and first-time demo login.
      created = generatedProfile(email, name);
      created.password = password;
      saveUser(created);
    } else if (existing) {
      if (isSignup) throw new Error('An account already exists for this email. Log in instead.');
      if (existing.password && existing.password !== password) throw new Error('That password does not match this demo account.');
      if (!existing.password) { existing.password = password; saveUser(existing); }
    }
    const user = getUser(email) || created || existing;
    if (!user) throw new Error('Unable to save this demo profile. Please try again.');
    if (name && name.trim() && isSignup) { user.name = name.trim(); saveUser(user); }
    setSession(email); return user;
  }
  function googleLogin(email, name) {
    email = slug(email);
    if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) throw new Error('Use a Gmail address for Google sign-in.');
    let user = getUser(email);
    if (!user) { user = generatedProfile(email, name); user.provider = 'google'; saveUser(user); }
    setSession(email); return user;
  }
  function logout() { localStorage.removeItem(SESSION_KEY); legacy.forEach(k => localStorage.removeItem(k)); }
  function guard() { if (!current()) { location.replace('login.html'); return false; } return true; }
  function syncLegacy() { const user = current(); if (!user) return; localStorage.setItem('smartsense_user_name', user.name); localStorage.setItem('smartsense_user_email', user.email); localStorage.setItem('smartsense_user_role', user.role); localStorage.setItem('smartsense_user_desk', user.desk); localStorage.setItem('smartsense_user_floor', user.floor); }
  window.SmartSenseAuth = { readUsers, saveUser, getUser, current, updateCurrentUser, login, googleLogin, logout, guard, isLoggedIn: () => !!current(), initials, syncLegacy };
  syncLegacy();
})();
