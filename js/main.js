// The waitlist form. It posts nowhere yet: data-endpoint is empty, so it validates,
// says plainly that nothing was sent, and never prints a success state.
document.querySelectorAll('form[data-endpoint]').forEach((form) => {
  const email = form.querySelector('input[type="email"]');
  const help = form.querySelector('[aria-live]');
  const button = form.querySelector('button[type="submit"]');
  const helpDefault = help.textContent;

  const check = () => {
    const ok = email.checkValidity();
    if (ok) { email.removeAttribute('aria-invalid'); email.removeAttribute('aria-describedby'); }
    else { email.setAttribute('aria-invalid', 'true'); email.setAttribute('aria-describedby', help.id); }
    return ok;
  };

  email.addEventListener('input', () => { if (email.hasAttribute('aria-invalid') && check()) help.textContent = helpDefault; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!check()) {
      help.textContent = 'That address looks incomplete. Write it as name@example.com.';
      email.focus();
      return;
    }
    if (!form.dataset.endpoint) {
      help.textContent = 'Nothing was sent: the waitlist is not connected in this concept.';
      return;
    }
    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    fetch(form.dataset.endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then((r) => { help.textContent = r.ok ? 'You are on the waitlist as ' + email.value.trim() + '.' : 'That did not go through. Try again in a minute.'; })
      .catch(() => { help.textContent = 'That did not go through. Try again in a minute.'; })
      .finally(() => { button.removeAttribute('aria-busy'); button.disabled = false; });
  });
});

// Arrival: each drawn line and each plate plays once, when it comes into view.
// The CSS holds them back only under html.js with motion welcome, so the page is whole without this.
(() => {
  const els = document.querySelectorAll('[data-enter]');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const show = (el) => { el.classList.add('is-in'); io.unobserve(el); };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) show(e.target);
  }), { rootMargin: '0px 0px -16px 0px', threshold: 0 });
  els.forEach((el) => io.observe(el));
  // anything already on screen after a load, a reload or a jump to an anchor shows at once
  const inView = () => els.forEach((el) => {
    if (el.classList.contains('is-in')) return;
    const b = el.getBoundingClientRect();
    if (b.bottom > 0 && b.top < innerHeight && b.width) show(el);
  });
  inView();
  addEventListener('load', inView);
  addEventListener('pageshow', inView);
  addEventListener('hashchange', () => requestAnimationFrame(inView));
})();
