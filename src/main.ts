import yaml from 'js-yaml';
import { generateSlides, showSlide, next, prev, state } from './slides';
import { toggleTheme, toggleLaser, toggleFullscreen, exportPDF, handleKeyDown, handlePresentationClick } from './events';
import { Slide } from './slideTypes';
import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/styles/github.css';
import 'mathjax-full/es5/tex-svg.js';

let slideData: Slide[] = [];
let defaultFooterText = '';

document.addEventListener('DOMContentLoaded', () => {
  const presentation = document.getElementById('presentation') as HTMLElement;
  const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
  const themeBtn = document.getElementById('theme-btn') as HTMLButtonElement;
  const fullscreenBtn = document.getElementById('fullscreen-btn') as HTMLButtonElement;
  const pdfBtn = document.getElementById('pdf-btn') as HTMLButtonElement;
  const laserBtn = document.getElementById('laser-btn') as HTMLButtonElement;
  const pageNumberEl = document.getElementById('page-number') as HTMLElement;
  const progressBar = document.getElementById('progress-bar') as HTMLElement;
  const progressHandle = document.getElementById('progress-handle');
  const progressBarContainer = document.getElementById('progress-bar-container') as HTMLElement;
  const notesContent = document.getElementById('notes-content') as HTMLElement;
  const nextSlidePreviewEl = document.getElementById('next-slide-preview') as HTMLElement;
  const fileInputsContainer = document.getElementById('file-inputs') as HTMLElement;
  const laserPointer = document.getElementById('laser-pointer') as HTMLElement;

  const notesContentEls = [notesContent];
  const nextSlidePreviewEls = [nextSlidePreviewEl];

  function updatePresentationSize() {
    const wrapper = document.getElementById('presentation-wrapper') as HTMLElement;
    const baseWidth = 1280;
    const baseHeight = 720;
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    const scale = Math.min(maxWidth / baseWidth, maxHeight / baseHeight);

    const width = baseWidth * scale;
    const height = baseHeight * scale;
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    presentation.style.setProperty('--presentation-scale', String(scale));

    const fontScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
    const fontSize = 18 * scale * fontScale;
    document.documentElement.style.fontSize = `${fontSize}px`;
  }

  function start() {
    generateSlides(presentation, fileInputsContainer, slideData, defaultFooterText);
    updatePresentationSize();

    nextBtn.addEventListener('click', () => next(slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn));
    prevBtn.addEventListener('click', () => prev(slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn));
    themeBtn.addEventListener('click', () => toggleTheme(themes, themeIndex));
    laserBtn.addEventListener('click', () => toggleLaser(laserPointer));
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    pdfBtn.addEventListener('click', () => exportPDF(state.slides, presentation, (i) => showSlide(i, slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn)));
    presentation.addEventListener('click', e => handlePresentationClick(e as MouseEvent, i => showSlide(i, slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn)));
    document.addEventListener('keydown', e => handleKeyDown(e, { next: () => next(slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn), prev: () => prev(slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn), toggleFullscreen, toggleSpeakerNotes: () => {}, toggleLaser: () => toggleLaser(laserPointer), exportPDF: () => exportPDF(state.slides, presentation, (i) => showSlide(i, slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn)) }));

    const startSlide = 0;
    showSlide(startSlide, slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn);
  }

  const themes = ['', 'theme-academic', 'theme-forest', 'theme-ocean'];
  const themeIndex = { value: 0 };

  const params = new URLSearchParams(window.location.search);
  const yamlFile = params.get('yaml') || params.get('slides') || 'slides.yaml';
  fetch(yamlFile)
    .then(res => res.text())
    .then(text => {
      const yamlData = yaml.load(text) as any;
      defaultFooterText = yamlData.defaultFooterText || '';
      if (yamlData.fontScale) {
        document.documentElement.style.setProperty('--font-scale', yamlData.fontScale);
      }
      slideData = [...(yamlData.editableSlides || [])];
      start();
    })
    .catch(err => {
      console.error(`failed to load ${yamlFile}`, err);
      start();
    });
});
