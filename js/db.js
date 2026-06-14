// ════════════════════════════════════════════════════
//  db.js — All Firestore & Auth operations
//  Every function is async and writes to / reads from
//  the real cloud database. Changes are instantly live
//  for every visitor worldwide.
// ════════════════════════════════════════════════════

const _db   = () => firebase.firestore();
const _auth = () => firebase.auth();

// ── POSTS ─────────────────────────────────────────────

/**
 * Get all posts, optionally filtered by category.
 * Returns newest first.
 */
async function dbGetPosts(category = null) {
  let q = _db().collection('posts');
  if (category) {
    // No orderBy here — avoids composite index requirement
    q = q.where('category', '==', category);
  } else {
    q = q.orderBy('date', 'desc');
  }
  const snap = await q.get();
  const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort by date descending when category filter is applied (client-side)
  if (category) {
    docs.sort((a, b) => {
      const da = a.date || a.createdAt || '';
      const db2 = b.date || b.createdAt || '';
      return da > db2 ? -1 : da < db2 ? 1 : 0;
    });
  }
  return docs;
}

/** Get a single post by Firestore document ID. */
async function dbGetPost(id) {
  const doc = await _db().collection('posts').doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/** Create a new post. Returns the new document ID (string). */
async function dbCreatePost(data) {
  const ref = await _db().collection('posts').add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing post by ID. */
async function dbUpdatePost(id, data) {
  await _db().collection('posts').doc(id).update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/** Permanently delete a post by ID. Immediately removed for all visitors. */
async function dbDeletePost(id) {
  await _db().collection('posts').doc(id).delete();
}

/** Seed default sample posts if the posts collection is empty. */
async function dbSeedPosts() {
  const snap = await _db().collection('posts').limit(1).get();
  if (!snap.empty) return false; // Already has posts

  const defaults = [
    {
      title: "Options Chain Analysis: Reading the Market Like a Pro",
      excerpt: "Understanding put-call ratios and open interest to anticipate price movements before they happen. A practical framework for daily traders.",
      category: "trading", date: "2026-06-10", readTime: "8 min", featured: true, emoji: "📊",
      content: `<h2>Introduction to Options Chain Analysis</h2><p>The options chain is one of the most powerful tools available to a modern trader. When read correctly, it reveals where institutional money is positioned and where the market is likely to move in the short term.</p><h2>The Put-Call Ratio</h2><p>A put-call ratio above 1.0 suggests bearish sentiment — more puts are being bought than calls. But contrarian traders often see this as a bullish signal, as excessive pessimism can precede a market bounce.</p><blockquote>"The options market doesn't lie. It shows you where the smart money is hedging, and hedging always tells a story." — Manjunathswamy Hiremath</blockquote><h2>Open Interest Clusters</h2><p>Strike prices with massive open interest become natural support/resistance levels. Market makers actively manage their delta exposure around these strikes, making them magnetic price levels.</p><div class="highlight-box"><strong>Key Insight:</strong> Always cross-reference OI clusters with your technical analysis. When both align, your conviction level should be significantly higher.</div>`
    },
    {
      title: "Risk Management: The One Skill That Separates Survivors from Losers",
      excerpt: "After 4 years of active trading, here's the uncomfortable truth about position sizing and why most traders blow their accounts in the first year.",
      category: "trading", date: "2026-06-05", readTime: "6 min", featured: false, emoji: "🎯",
      content: `<h2>Why Risk Management is Everything</h2><p>You can have the best strategy in the world, but without proper risk management, you will eventually lose everything. This isn't pessimism — it's mathematics.</p><h2>The 1% Rule</h2><p>Never risk more than 1-2% of your total capital on a single trade. This allows you to survive 50 consecutive losses before depleting your account, giving your edge enough trades to manifest.</p><h2>Position Sizing Formula</h2><p>Position Size = (Account Capital × Risk %) ÷ (Entry Price − Stop Loss Price)</p>`
    },
    {
      title: "The Psychology of Trading: Why Your Brain is Your Biggest Enemy",
      excerpt: "Cognitive biases in trading — from loss aversion to confirmation bias. Understanding these mental traps is the first step to overcoming them.",
      category: "trading", date: "2026-05-28", readTime: "7 min", featured: false, emoji: "🧠",
      content: `<h2>Cognitive Biases in Trading</h2><p>Every trader faces the same psychological challenges regardless of experience level. The key is recognizing when emotions are driving decisions rather than logic.</p><h2>Loss Aversion</h2><p>Studies show losses feel roughly twice as painful as equivalent gains feel good. This asymmetry causes traders to hold losing positions too long and cut winning positions too early — the exact opposite of what you should do.</p>`
    },
    {
      title: "Book Review: 'The Intelligent Investor' — Timeless Wisdom in a Modern Market",
      excerpt: "Benjamin Graham's masterpiece remains as relevant in 2026 as it was in 1949. Here's what every trader and investor can take away from it.",
      category: "books", date: "2026-06-01", readTime: "5 min", featured: false, emoji: "📚",
      content: `<h2>Overview</h2><p>Benjamin Graham's 'The Intelligent Investor' is the bible of value investing. Despite being written decades ago, its core principles remain the foundation of sound financial thinking.</p><h2>The Mr. Market Analogy</h2><p>Graham's most powerful concept is "Mr. Market" — an imaginary business partner who shows up every day offering to buy your shares or sell you his at different prices. Sometimes his prices are rational. Sometimes they're driven by fear or euphoria. Your job is to take advantage of his irrationality, not be swept up in it.</p>`
    },
    {
      title: "Book Review: 'Reminiscences of a Stock Operator' — Jesse Livermore's Legacy",
      excerpt: "The fictionalized biography of Jesse Livermore is still the most important book a trader can read. Here's why it changed my approach to markets.",
      category: "books", date: "2026-05-20", readTime: "6 min", featured: false, emoji: "📖",
      content: `<h2>Why This Book Matters</h2><p>Jesse Livermore made and lost several fortunes in the early 1900s markets. His story — despite the era — maps perfectly onto modern trading psychology and market behavior.</p><h2>Key Takeaway: Let Winners Run</h2><p>Livermore's greatest lesson: "It was never my thinking that made the big money for me. It was always my sitting. Got that? My sitting tight." Patience in a winning position is one of the hardest skills to develop.</p>`
    },
    {
      title: "Weekend Escape: The Hidden Waterfalls of Coorg — A Trader's Retreat",
      excerpt: "When the markets close on Friday, sometimes the best trade you can make is a road trip. My solo journey to Karnataka's coffee country.",
      category: "trips", date: "2026-05-15", readTime: "4 min", featured: false, emoji: "🌿",
      content: `<h2>Getting There</h2><p>Coorg (Kodagu) is a 5-hour drive from Bangalore — a perfect weekend escape for anyone needing to reset after an intense trading week. The winding ghats force you to be present. No phone signal, no charts, no P&amp;L to obsess over.</p><h2>Where to Stay</h2><p>I stayed at a small homestay near Madikeri town. The kind where breakfast is served at 7am sharp and coffee is from the estate out the window. ₹1,200 per night, and worth every rupee.</p>`
    },
    {
      title: "Hampi: Ancient Ruins and Modern Lessons in Wealth",
      excerpt: "Walking through the ruins of the Vijayanagara Empire taught me more about market cycles and civilizational wealth than any finance textbook.",
      category: "trips", date: "2026-04-30", readTime: "5 min", featured: false, emoji: "🏛️",
      content: `<h2>A Kingdom That Once Was</h2><p>Hampi was once one of the richest cities in the world. Walking through its ruins, you realize that even the greatest wealth can be transient — a humbling thought for any investor.</p><h2>The Lesson for Traders</h2><p>Empires rise and fall. So do market cycles. The Vijayanagara kingdom dominated for 200 years before a single military defeat erased it. Nothing — not even a 200-year bull run — lasts forever. Always preserve capital.</p>`
    },
    {
      title: "High-Protein Ragi Dosa: A Trader's Breakfast for Sharp Mornings",
      excerpt: "The right morning meal sets up your decision-making for the day. This Karnataka-style ragi dosa recipe keeps energy steady through volatile market sessions.",
      category: "cooking", date: "2026-05-25", readTime: "3 min", featured: false, emoji: "🍳",
      content: `<h2>Why Ragi?</h2><p>Ragi (finger millet) is a nutritional powerhouse — high in calcium, fiber, and amino acids. A steady energy release means no mid-morning crash during critical market hours.</p><h2>Ingredients (serves 2)</h2><ul><li>1 cup ragi flour</li><li>¼ cup urad dal (soaked overnight)</li><li>Salt to taste</li><li>Water as needed</li><li>Oil for cooking</li></ul><h2>Method</h2><p>Blend soaked urad dal smooth. Mix with ragi flour, salt, and enough water to make a batter slightly thinner than regular dosa batter. Rest for 30 minutes. Cook on a hot iron tawa with a few drops of oil. Serve with coconut chutney.</p>`
    },
    {
      title: "Grandma's Bisi Bele Bath: The Comfort Food That Resets the Week",
      excerpt: "After a tough trading week, nothing resets the mind like a pot of Bisi Bele Bath simmering on the stove. My grandmother's recipe, perfected.",
      category: "cooking", date: "2026-05-10", readTime: "4 min", featured: false, emoji: "🥘",
      content: `<h2>What is Bisi Bele Bath?</h2><p>Bisi Bele Bath literally means "hot lentil rice" in Kannada. It's a one-pot dish of rice, toor dal, vegetables, and a special spice powder that defines Karnataka home cooking. Every family has their version — this is ours.</p><h2>The Secret: The Spice Powder</h2><p>The homemade Bisi Bele Bath powder makes the difference. Dry roast: 2 tbsp chana dal, 1 tbsp urad dal, 4 dry red chillies, 1 tbsp coriander seeds, ½ tsp pepper, a small piece of cinnamon, 2 cloves, 1 tbsp fresh coconut. Grind to a coarse powder. This keeps refrigerated for weeks.</p>`
    }
  ];

  const batch = _db().batch();
  defaults.forEach(post => {
    const ref = _db().collection('posts').doc();
    batch.set(ref, { ...post, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  });
  await batch.commit();
  return true;
}

// ── SUBSCRIBERS ───────────────────────────────────────

/** Add a newsletter subscriber. Returns false if email already exists. */
async function dbAddSubscriber(email) {
  const snap = await _db().collection('subscribers')
    .where('email', '==', email.toLowerCase().trim()).get();
  if (!snap.empty) return false;
  await _db().collection('subscribers').add({
    email: email.toLowerCase().trim(),
    date: new Date().toISOString(),
  });
  return true;
}

/** Get all subscribers (admin only). */
async function dbGetSubscribers() {
  const snap = await _db().collection('subscribers').orderBy('date', 'desc').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/** Delete a subscriber by ID. */
async function dbDeleteSubscriber(id) {
  await _db().collection('subscribers').doc(id).delete();
}

// ── MESSAGES ──────────────────────────────────────────

/** Save a contact form message. */
async function dbAddMessage(data) {
  await _db().collection('messages').add({
    ...data,
    date: new Date().toISOString(),
  });
}

/** Get all contact messages (admin only). */
async function dbGetMessages() {
  const snap = await _db().collection('messages').orderBy('date', 'desc').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/** Delete a message by ID. */
async function dbDeleteMessage(id) {
  await _db().collection('messages').doc(id).delete();
}

// ── AUTH ──────────────────────────────────────────────

/** Sign in with email + password. */
async function dbSignIn(email, password) {
  return await _auth().signInWithEmailAndPassword(email, password);
}

/** Sign out the current user. */
async function dbSignOut() {
  return await _auth().signOut();
}

/** Listen for auth state changes. Returns the unsubscribe function. */
function dbOnAuthChange(callback) {
  return _auth().onAuthStateChanged(callback);
}

/** Returns the currently signed-in user, or null. */
function dbCurrentUser() {
  return _auth().currentUser;
}
