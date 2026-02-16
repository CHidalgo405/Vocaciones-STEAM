import { Component, AfterViewInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LucideAngularModule, Brain, Compass, MapPin, Rocket, Facebook, Twitter, Instagram, Linkedin, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PreloaderComponent } from '../../shared/preloader/preloader.component';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LucideAngularModule, PreloaderComponent],
  providers: [
    { provide: LUCIDE_ICONS, useValue: new LucideIconProvider({ Brain, Compass, MapPin, Rocket, Facebook, Twitter, Instagram, Linkedin }) }
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class PwaHomeComponent implements AfterViewInit, OnDestroy {

  isLoading = true;
  loadingProgress = 0;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    this.initPreloader();

    setTimeout(() => {
      this.initCursorAnimation();
      this.initMagneticButtons();
      this.initProfessionalTextAnimations();
    }, 1800);
  }

  // --- PRELOADER ---
  initPreloader() {
    const interval = setInterval(() => {
      if (this.loadingProgress < 100) {
        this.loadingProgress += Math.floor(Math.random() * 8) + 3;
        if (this.loadingProgress > 100) this.loadingProgress = 100;
      } else {
        clearInterval(interval);
        gsap.to('.preloader', {
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          onComplete: () => {
            this.isLoading = false;
            setTimeout(() => ScrollTrigger.refresh(), 500);
          }
        });
      }
    }, 120);
  }

  // --- CURSOR ---
  initCursorAnimation() {
    const cursorDot = this.document.querySelector('.cursor-dot');
    const cursorOutline = this.document.querySelector('.cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    window.addEventListener('mousemove', (e) => {
      gsap.set(cursorDot, { x: e.clientX, y: e.clientY });
      gsap.to(cursorOutline, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
    });

    const interactables = this.document.querySelectorAll('button, a, .card, .cta-button, .cta-modern, .social-btn');
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => this.renderer.addClass(this.document.body, 'hovering'));
      el.addEventListener('mouseleave', () => this.renderer.removeClass(this.document.body, 'hovering'));
    });
  }

  // --- BOTONES ---
  initMagneticButtons() {
    const buttons = this.document.querySelectorAll('.cta-button, .cta-modern, .social-btn');
    buttons.forEach((btn: any) => {
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
      });
    });
  }

  // --- TEXTO ---
  initProfessionalTextAnimations() {
    const titles = this.document.querySelectorAll('.reveal-text');
    titles.forEach((title: any) => {
      this.splitTextToSpans(title);
      const chars = title.querySelectorAll('.char');
      gsap.fromTo(chars,
        { y: 80, opacity: 0, rotationX: -90, filter: 'blur(10px)' },
        {
          scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, rotationX: 0, filter: 'blur(0px)',
          stagger: 0.02, duration: 1, ease: 'back.out(1.5)'
        }
      );
    });
  }

  splitTextToSpans(element: HTMLElement) {
    const nodes = Array.from(element.childNodes);
    element.innerHTML = ''; 
    nodes.forEach(node => {
      if (node.nodeType === 3) { 
        const text = node.textContent || '';
        text.split('').forEach(char => {
          const span = this.document.createElement('span');
          span.innerHTML = char === ' ' ? '&nbsp;' : char;
          span.classList.add('char');
          element.appendChild(span);
        });
      } else { element.appendChild(node); }
    });
  }

  ngOnDestroy() {
    ScrollTrigger.getAll().forEach(t => t.kill());
  }
}