// ════════════════════════════════════════════════════
//  blog.js — Blog rendering layer
//  All data comes from Firestore via db.js.
//  Changes in the admin panel are immediately live.
// ════════════════════════════════════════════════════

// ── HELPERS ───────────────────────────────────────────

function getCategoryClass(cat) {
  return { trading:'tag-trading', books:'tag-books', trips:'tag-trips', cooking:'tag-cooking', spirituality:'tag-spirituality', movies:'tag-movies', kdrama:'tag-kdrama' }[cat] || 'tag-books';
}
function getCategoryLabel(cat) {
  return { trading:'📈 Trading', books:'📚 Book Reviews', trips:'🌍 Trips', cooking:'🍳 Cooking', spirituality:'🕉️ Spirituality', movies:'🎬 Movies', kdrama:'🎭 K-Drama' }[cat] || cat;
}
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
}

// ── SKELETON LOADERS ─────────────────────────────────

function skeletonCard(dark = false) {
  return `
  <div class="blog-card ${dark ? 'blog-card-dark' : ''}">
    <div class="blog-card-img skeleton" style="height:200px"></div>
    <div class="blog-card-body" style="gap:0.75rem;display:flex;flex-direction:column">
      <div class="skeleton" style="height:22px;width:35%;border-radius:50px"></div>
      <div class="skeleton" style="height:18px;width:92%"></div>
      <div class="skeleton" style="height:18px;width:78%"></div>
      <div class="skeleton" style="height:14px;width:88%"></div>
      <div class="skeleton" style="height:14px;width:65%"></div>
    </div>
  </div>`;
}

function skeletonFeatured() {
  return `
  <div class="featured-post" style="min-height:380px">
    <div class="featured-img skeleton" style="opacity:0.3"></div>
    <div class="featured-body" style="display:flex;flex-direction:column;gap:1rem;justify-content:center">
      <div class="skeleton" style="height:22px;width:28%;border-radius:50px"></div>
      <div class="skeleton" style="height:32px;width:85%"></div>
      <div class="skeleton" style="height:32px;width:60%"></div>
      <div class="skeleton" style="height:16px;width:92%"></div>
      <div class="skeleton" style="height:16px;width:78%"></div>
      <div class="skeleton" style="height:44px;width:160px;border-radius:50px;margin-top:0.5rem"></div>
    </div>
  </div>`;
}

// ── CARD RENDERER ────────────────────────────────────

function renderCard(post, dark = false) {
  return `
  <article class="blog-card ${dark ? 'blog-card-dark' : ''}" onclick="window.location='post.html?id=${post.id}'" style="cursor:pointer">
    <div class="blog-card-img">${post.emoji || '📝'}</div>
    <div class="blog-card-body">
      <div class="blog-card-meta">
        <span class="tag ${getCategoryClass(post.category)}">${getCategoryLabel(post.category)}</span>
        <span class="blog-card-date">${formatDate(post.date)}</span>
      </div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <div class="blog-card-footer">
        <span class="read-time">⏱ ${post.readTime || '5 min'} read</span>
        <span class="read-more">Read more →</span>
      </div>
    </div>
  </article>`;
}

// ── HOMEPAGE ──────────────────────────────────────────

async function renderHomepagePosts() {
  const featuredEl = document.getElementById('featured-post');
  const recentEl   = document.getElementById('recent-posts');
  const tradingEl  = document.getElementById('trading-posts');

  // Show skeletons
  if (featuredEl) featuredEl.innerHTML = skeletonFeatured();
  if (recentEl)   recentEl.innerHTML   = Array(6).fill(skeletonCard()).join('');
  if (tradingEl)  tradingEl.innerHTML  = Array(3).fill(skeletonCard(true)).join('');

  try {
    const posts = await dbGetPosts();

    // Featured
    if (featuredEl) {
      const feat = posts.find(p => p.featured) || posts.find(p => p.category === 'trading') || posts[0];
      if (feat) {
        featuredEl.innerHTML = `
        <div class="featured-img">${feat.emoji || '📊'}</div>
        <div class="featured-body">
          <span class="tag tag-trading">⭐ Featured · ${getCategoryLabel(feat.category)}</span>
          <h2>${feat.title}</h2>
          <p>${feat.excerpt}</p>
          <div class="author-row">
            <div class="author-avatar">MH</div>
            <div class="author-info">
              <div class="name">Manjunathswamy Hiremath</div>
              <div class="meta">${formatDate(feat.date)} · ${feat.readTime || '5 min'} read</div>
            </div>
          </div>
          <a href="post.html?id=${feat.id}" class="btn btn-primary">Read Full Article</a>
        </div>`;
      } else {
        featuredEl.innerHTML = '<p style="color:var(--gray);padding:3rem;text-align:center">No posts yet. Add your first post in the admin panel.</p>';
      }
    }

    // Recent (latest 6)
    if (recentEl) {
      recentEl.innerHTML = posts.length
        ? posts.slice(0, 6).map(p => renderCard(p)).join('')
        : '<p style="color:var(--gray);grid-column:1/-1;text-align:center;padding:3rem">No posts yet.</p>';
    }

    // Trading (latest 3 trading posts)
    if (tradingEl) {
      const trading = posts.filter(p => p.category === 'trading').slice(0, 3);
      tradingEl.innerHTML = trading.length
        ? trading.map(p => renderCard(p, true)).join('')
        : '<p style="color:var(--gray);grid-column:1/-1;text-align:center;padding:2rem">No trading posts yet.</p>';
    }
  } catch (err) {
    console.error('renderHomepagePosts:', err);
    if (recentEl) recentEl.innerHTML   = '<p style="color:#FF6B6B;grid-column:1/-1;text-align:center;padding:2rem">Failed to load posts. Check Firebase config.</p>';
    if (featuredEl) featuredEl.innerHTML = '';
  }
}

// ── CATEGORY PAGE ────────────────────────────────────

async function renderCategoryPage(cat) {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  grid.innerHTML = Array(6).fill(skeletonCard()).join('');

  try {
    const posts = await dbGetPosts(cat);
    grid.innerHTML = posts.length
      ? posts.map(p => renderCard(p)).join('')
      : '<p style="color:var(--gray);grid-column:1/-1;text-align:center;padding:4rem 0">No articles yet. Check back soon!</p>';
  } catch (err) {
    grid.innerHTML = '<p style="color:#FF6B6B;grid-column:1/-1;text-align:center;padding:2rem">Failed to load posts.</p>';
  }
}

// ── ALL POSTS PAGE ────────────────────────────────────

async function renderAllPosts(filterCat = 'all') {
  const grid = document.getElementById('all-posts-grid');
  if (!grid) return;

  grid.innerHTML = Array(6).fill(skeletonCard()).join('');

  try {
    const posts = await dbGetPosts(filterCat === 'all' ? null : filterCat);
    grid.innerHTML = posts.length
      ? posts.map(p => renderCard(p)).join('')
      : '<p style="color:var(--gray);grid-column:1/-1;text-align:center;padding:4rem 0">No articles found.</p>';
  } catch (err) {
    grid.innerHTML = '<p style="color:#FF6B6B;grid-column:1/-1;text-align:center;padding:2rem">Failed to load posts.</p>';
  }
}

// ── SINGLE POST ───────────────────────────────────────

async function renderPost() {
  const container = document.getElementById('post-container');
  if (!container) return;

  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    container.innerHTML = '<div style="padding:4rem;text-align:center"><h2 style="color:white">No post ID in URL.</h2><a href="index.html" class="btn btn-green" style="margin-top:1rem">← Go Home</a></div>';
    return;
  }

  // Show loading state
  document.getElementById('post-title').textContent = 'Loading...';
  document.getElementById('post-body').innerHTML    = Array(4).fill('<div class="skeleton" style="height:18px;width:94%;margin-bottom:0.85rem;border-radius:6px"></div>').join('');

  try {
    const post = await dbGetPost(id);
    if (!post) {
      container.innerHTML = '<div style="padding:4rem;text-align:center"><h2 style="color:white">Post not found.</h2><a href="index.html" class="btn btn-green" style="margin-top:1rem">← Go Home</a></div>';
      return;
    }

    document.title = `${post.title} | MNH Blog`;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-date').textContent  = formatDate(post.date);
    document.getElementById('post-read').textContent  = (post.readTime || '5 min') + ' read';
    document.getElementById('post-cat').textContent   = getCategoryLabel(post.category);
    document.getElementById('post-body').innerHTML    = post.content || `<p>${post.excerpt}</p>`;

    // Related posts
    const relatedEl = document.getElementById('related-posts');
    if (relatedEl) {
      const related = await dbGetPosts(post.category);
      relatedEl.innerHTML = related
        .filter(p => p.id !== post.id)
        .slice(0, 3)
        .map(p => renderCard(p)).join('');
    }
  } catch (err) {
    console.error('renderPost:', err);
    document.getElementById('post-title').textContent = 'Error loading post';
    document.getElementById('post-body').innerHTML    = '<p style="color:#FF6B6B">Failed to load this article. Please try again.</p>';
  }
}

// ── CATEGORY COUNTS ───────────────────────────────────

async function renderCategoryCounts() {
  try {
    const posts = await dbGetPosts();
    const counts = { trading: 0, books: 0, trips: 0, cooking: 0, spirituality: 0, movies: 0, kdrama: 0 };
    posts.forEach(p => { if (counts[p.category] !== undefined) counts[p.category]++; });
    Object.entries(counts).forEach(([cat, n]) => {
      const el = document.getElementById(`count-${cat}`);
      if (el) el.textContent = `${n} article${n !== 1 ? 's' : ''}`;
    });
  } catch (_) { /* counts are non-critical */ }
}

// ── PAGE INIT ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Homepage
  if (document.getElementById('recent-posts') || document.getElementById('featured-post')) {
    await renderHomepagePosts();
  }

  // Category counts (homepage cat strip)
  renderCategoryCounts();

  // Category page (trading, books, trips, cooking)
  const catPage = document.body.dataset.cat;
  if (catPage) await renderCategoryPage(catPage);

  // Single post
  if (document.getElementById('post-container')) await renderPost();

  // All-posts page with filter tabs
  if (document.getElementById('all-posts-grid')) {
    await renderAllPosts();
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        await renderAllPosts(tab.dataset.cat);
      });
    });
  }
});
