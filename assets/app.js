const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const header = document.querySelector('[data-header]');
if (header && !header.classList.contains('solid')) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 32);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 })
  : null;

document.querySelectorAll('.reveal').forEach(el => {
  if (observer) observer.observe(el);
  else el.classList.add('visible');
});

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

const schedules = {
  0: [['11:30','22:00']],
  1: [['11:30','15:00'],['17:00','22:00']],
  2: [],
  3: [['11:30','15:00'],['17:00','22:00']],
  4: [['11:30','15:00'],['17:00','22:00']],
  5: [['11:30','15:00'],['17:00','22:00']],
  6: [['11:30','22:00']]
};

function berlinParts() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone:'Europe/Berlin', weekday:'short', hour:'2-digit', minute:'2-digit', hour12:false
  }).formatToParts(new Date());
  const val = type => parts.find(p => p.type === type)?.value;
  const dayMap = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
  return { day: dayMap[val('weekday')], time: Number(val('hour')) * 60 + Number(val('minute')) };
}

function mins(t) {
  const [h,m] = t.split(':').map(Number);
  return h * 60 + m;
}

try {
  const {day,time} = berlinParts();
  const today = schedules[day] || [];
  const openWindow = today.find(([start,end]) => time >= mins(start) && time < mins(end));
  const nextWindow = today.find(([start]) => time < mins(start));
  const label = document.querySelector('[data-open-label]');
  const pill = document.querySelector('[data-open-pill]');

  if (openWindow) {
    if (label) label.textContent = 'Heute geöffnet bis ' + openWindow[1] + ' Uhr';
    if (pill) { pill.textContent = 'Jetzt geöffnet'; pill.classList.add('is-open'); }
  } else if (nextWindow) {
    if (label) label.textContent = 'Heute wieder ab ' + nextWindow[0] + ' Uhr';
    if (pill) pill.textContent = 'Heute ab ' + nextWindow[0] + ' Uhr';
  } else {
    if (label) label.textContent = day === 2 ? 'Dienstag geschlossen' : 'Heute geschlossen';
    if (pill) pill.textContent = 'Geschlossen';
  }
} catch (_) {}

const filterButtons = document.querySelectorAll('[data-filter]');
const sections = document.querySelectorAll('[data-category]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  sections.forEach(section => {
    section.hidden = filter !== 'all' && section.dataset.category !== filter;
  });
  const firstVisible = [...sections].find(s => !s.hidden);
  if (firstVisible) {
    const top = firstVisible.getBoundingClientRect().top + window.scrollY - 170;
    window.scrollTo({ top, behavior:'smooth' });
  }
}));