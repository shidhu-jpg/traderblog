// Loads admin-created categories from Firestore and injects them into the navbar
// before the "About" link. Runs on every public page.
document.addEventListener('DOMContentLoaded', async () => {
  if (!window._firebaseReady) return;
  try {
    const cats = await dbGetCategories();
    if (!cats.length) return;
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    const aboutLi = Array.from(navLinks.querySelectorAll('li')).find(
      li => li.querySelector('a[href*="about.html"]')
    );
    const currentSlug = new URLSearchParams(location.search).get('cat');
    cats.forEach(cat => {
      const li = document.createElement('li');
      const isActive = currentSlug === cat.slug;
      li.innerHTML = `<a href="category.html?cat=${cat.slug}"${isActive ? ' class="active"' : ''}>${cat.emoji || ''} ${cat.name}</a>`;
      if (aboutLi) navLinks.insertBefore(li, aboutLi);
      else navLinks.appendChild(li);
    });
  } catch (_) {}
});
