const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel__track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const dotsNav = carousel.querySelector('.carousel__dots');

    // Créer les dots
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      if (i === 0) btn.classList.add('active');
      dotsNav.appendChild(btn);
    });
    const dots = Array.from(dotsNav.children);

    let index = 0;
    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot,i) => dot.classList.toggle('active', i===index));
    };

    nextBtn.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      update();
    });
    prevBtn.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
    });
    dots.forEach((dot,i) => dot.addEventListener('click', () => {
      index = i;
      update();
    }));
  });
  
  // --- MENU BURGER ---
const btn = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');

btn?.addEventListener('click', () => {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  links.classList.toggle('open');
  document.body.classList.toggle('no-scroll', !expanded);
});