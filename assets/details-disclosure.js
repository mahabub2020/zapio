class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.summary = this.mainDetailsToggle.querySelector('summary');
    this.content = this.summary.nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
    this.summary.addEventListener('click', this.onSummaryClick.bind(this));
  }

  onSummaryClick(event) {
    if (!this.mainDetailsToggle.hasAttribute('open')) return;

    event.preventDefault();
    this.mainDetailsToggle.classList.add('is-closing');
    setTimeout(() => {
      this.close();
      this.mainDetailsToggle.classList.remove('is-closing');
    }, 400); // Matches the 0.4s CSS transition
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.summary.setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.init();
  }

  init() {
    this.mainDetailsToggle.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.mainDetailsToggle.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  onMouseEnter() {
    if (!window.matchMedia('(min-width: 990px)').matches) return;
    
    // If we are in the process of closing, cancel it and reopen/stay open
    if (this.mainDetailsToggle.classList.contains('is-closing') || this.hasAttribute('open')) {
      this.mainDetailsToggle.classList.remove('is-closing');
      clearTimeout(this.closeTimer);
    }
    
    this.mainDetailsToggle.setAttribute('open', true);
    this.summary.setAttribute('aria-expanded', true);
  }

  onMouseLeave() {
    if (!window.matchMedia('(min-width: 990px)').matches) return;
    
    // Delay adding the closing class to allow for quick mouse movements
    this.closeTimer = setTimeout(() => {
        if (!this.mainDetailsToggle.matches(':hover')) {
             this.closeMenuDrawer();
        }
    }, 200); 
  }

  closeMenuDrawer() {
    this.mainDetailsToggle.classList.add('is-closing');
    this.summary.setAttribute('aria-expanded', false);
    
    // Wait for animation to finish before removing open attribute
    setTimeout(() => {
       // Check again if we haven't re-entered
       if (this.mainDetailsToggle.classList.contains('is-closing')) {
          this.mainDetailsToggle.removeAttribute('open');
          this.mainDetailsToggle.classList.remove('is-closing');
       }
    }, 400); // 400ms matches the CSS transition duration
  }

  onSummaryClick(event) {
    if (window.matchMedia('(min-width: 990px)').matches) {
       const url = this.summary.dataset.href;
       if (url) {
           event.preventDefault();
           window.location.href = url;
           return;
       }
    }
    super.onSummaryClick(event);
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);
