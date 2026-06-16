// Loads site settings from Firestore and applies them to the current page.
// Included on public pages; fails silently if no settings are saved yet.
(async function () {
  if (!window._firebaseReady) return;
  try {
    const doc = await firebase.firestore()
      .collection('site_settings').doc('main').get();
    if (!doc.exists) return;
    const s = doc.data();

    if (s.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]')
        .forEach(el => { el.href = s.instagram; });
    }
    if (s.twitter) {
      document.querySelectorAll('a[href*="x.com/"]')
        .forEach(el => { el.href = s.twitter; });
    }
    if (s.whatsapp) {
      const waUrl = 'https://wa.me/' + s.whatsapp;
      document.querySelectorAll('a[href*="wa.me/"]')
        .forEach(el => { el.href = waUrl; });
      document.querySelectorAll('[data-setting="whatsapp-display"]')
        .forEach(el => { el.textContent = 'WhatsApp: +' + s.whatsapp; });
    }
    if (s.bio1) {
      const el = document.getElementById('site-bio-1');
      if (el) el.textContent = s.bio1;
    }
    if (s.bio2) {
      const el = document.getElementById('site-bio-2');
      if (el) el.textContent = s.bio2;
    }
    if (s.location) {
      document.querySelectorAll('[data-setting="location"]')
        .forEach(el => { el.textContent = s.location; });
    }
  } catch (_) {}
})();
