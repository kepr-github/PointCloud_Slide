import hljs from 'highlight.js';
import type { Slide } from './slideTypes';
import { initPointCloud, ThreeInstance } from './pointCloud';

export interface SlidesState {
  currentSlide: number;
  currentFragment: number;
  totalSlides: number;
  slides: NodeListOf<HTMLElement>;
  threeJSInstances: Record<number, ThreeInstance>;
}

export const state: SlidesState = {
  currentSlide: 0,
  currentFragment: -1,
  totalSlides: 0,
  slides: document.querySelectorAll('.slide') as NodeListOf<HTMLElement>,
  threeJSInstances: {}
};

export function generateSlides(
  presentation: HTMLElement,
  fileInputsContainer: HTMLElement,
  slideData: Slide[],
  defaultFooterText: string
): void {
  state.totalSlides = slideData.length;
  let slideHTML = '';
  let fileInputHTML = '';

  slideData.forEach((data, index) => {
    let contentHTML = '';
    const footer = data.footerText !== undefined ? data.footerText : defaultFooterText;
    if (data.fileInputId) {
      fileInputHTML += `<input type="file" id="${data.fileInputId}" />`;
    }

    switch (data.type) {
      case 'title':
        contentHTML = `<div class="title-slide"><h1>${data.title}</h1><p class="author">${data.author}</p><p class="date">${data.date}</p></div>`;
        break;
      case 'list': {
        const listTag = data.ordered === false ? 'ul' : 'ol';
        const listItems = data.content
          .map(item => `<li ${item.jumpTo ? `data-jump-to="${item.jumpTo}"` : ''} class="${item.fragment ? 'fragment' : ''}">${(item as any).text || item}</li>`)
          .join('');
        contentHTML = `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content"><${listTag}>${listItems}</${listTag}></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
        break;
      }
      case 'code':
        contentHTML = `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content three-column"><div class="column"><h3>${data.subTitle || ''}</h3><p>${data.text || ''}</p></div><div class="column"><pre><code class="language-${data.language || 'plaintext'}">${data.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre></div></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
        break;
      case 'image':
        if (data.listContent && data.listContent.length) {
          const listItemsImg = data.listContent
            .map(item => `<li ${item.jumpTo ? `data-jump-to="${item.jumpTo}"` : ''} class="${item.fragment ? 'fragment' : ''}">${(item as any).text || item}</li>`)
            .join('');
          contentHTML = `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content two-column"><div class="column"><div class="image-slide-content"><img src="${data.imageSrc || ''}" alt="${data.title}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''}></div><p>${data.caption || ''}</p></div><div class="column"><ul>${listItemsImg}</ul></div></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
        } else {
          contentHTML = `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content"><div class="image-slide-content"><img src="${data.imageSrc || ''}" alt="${data.title}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''}></div><p>${data.caption || ''}</p><div>${(data as any).math || ''}</div></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
        }
        break;
      case 'video': {
        const isYouTube = !!data.videoId && !data.videoSrc;
        const videoSrc = data.videoSrc || (isYouTube ? `https://www.youtube.com/embed/${data.videoId}` : '');
        contentHTML = `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content"><div class="video-slide-content"><${isYouTube ? 'iframe' : 'video'} src="${videoSrc}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''} ${!isYouTube ? 'controls' : ''} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></${isYouTube ? 'iframe' : 'video'}></div><p>${data.caption || ''}</p></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
        break;
      }
      case 'pointCloud':
        contentHTML = `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content point-cloud-container" data-slide-index="${index}"><canvas class="point-cloud-canvas" data-points="${(data as any).points || 0}" data-use-vertex-colors="${(data as any).useVertexColors || false}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''} ${data.pointCloudSrc ? `data-src="${data.pointCloudSrc}"` : ''}></canvas></div><p style="text-align: center;">${data.caption || ''}</p><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
        break;
      case 'end':
        contentHTML = `<div class="end-slide"><h1>${data.title}</h1></div>`;
        break;
    }
    slideHTML += `<div class="slide ${data.type}-slide" data-index="${index}">${contentHTML}</div>`;
  });

  presentation.innerHTML = slideHTML;
  fileInputsContainer.innerHTML = fileInputHTML;
  state.slides = document.querySelectorAll('.slide');
  hljs.highlightAll();
}

export function showSlide(
  newIndex: number,
  slideData: Slide[],
  notesContentEls: HTMLElement[],
  nextSlidePreviewEls: HTMLElement[],
  pageNumberEl: HTMLElement,
  progressBar: HTMLElement,
  progressHandle: HTMLElement | null,
  prevBtn: HTMLButtonElement,
  nextBtn: HTMLButtonElement
): void {
  if (state.isTransitioning || newIndex < 0 || newIndex >= state.totalSlides) return;

  const oldSlideIndex = state.currentSlide;
  state.currentSlide = newIndex;
  state.currentFragment = -1;

  if (newIndex !== oldSlideIndex) {
    state.isTransitioning = true;
    const oldSlideEl = state.slides[oldSlideIndex];
    const newSlideEl = state.slides[newIndex];

    if (oldSlideEl) oldSlideEl.classList.add('is-exiting');
    if (newSlideEl) newSlideEl.classList.add('is-active');

    if (state.threeJSInstances[oldSlideIndex]) {
      cancelAnimationFrame(state.threeJSInstances[oldSlideIndex].animationId);
      delete state.threeJSInstances[oldSlideIndex];
    }
    const canvas = newSlideEl.querySelector<HTMLCanvasElement>('.point-cloud-canvas');
    if (canvas) {
      initPointCloud(canvas, newIndex, slideData, state.threeJSInstances);
    }

    setTimeout(() => {
      if (oldSlideEl) oldSlideEl.classList.remove('is-active', 'is-exiting');
      state.isTransitioning = false;
    }, 800);
  }

  const fragments = state.slides[state.currentSlide].querySelectorAll<HTMLElement>('.fragment');
  fragments.forEach((fragment, i) => {
    fragment.classList.toggle('is-visible', i <= state.currentFragment);
  });

  if (history.pushState) {
    history.pushState(null, '', `#slide=${state.currentSlide}`);
  }
  updateControls(slideData, notesContentEls, nextSlidePreviewEls, pageNumberEl, progressBar, progressHandle, prevBtn, nextBtn);
  if ((window as any).MathJax && typeof (window as any).MathJax.typesetPromise === 'function') {
    (window as any).MathJax.typesetPromise();
  }
}

export function next(slideData: Slide[], ...args: Parameters<typeof showSlide>): void {
  const fragments = state.slides[state.currentSlide].querySelectorAll('.fragment');
  if (state.currentFragment < fragments.length - 1) {
    state.currentFragment++;
    showSlide(state.currentSlide, slideData, ...args.slice(2) as any);
  } else if (state.currentSlide < state.totalSlides - 1) {
    showSlide(state.currentSlide + 1, slideData, ...args.slice(2) as any);
  }
}

export function prev(slideData: Slide[], ...args: Parameters<typeof showSlide>): void {
  const fragments = state.slides[state.currentSlide].querySelectorAll('.fragment');
  if (state.currentFragment > -1) {
    state.currentFragment--;
    showSlide(state.currentSlide, slideData, ...args.slice(2) as any);
  } else if (state.currentSlide > 0) {
    const prevSlideFragments = state.slides[state.currentSlide - 1].querySelectorAll('.fragment');
    state.currentFragment = prevSlideFragments.length - 1;
    showSlide(state.currentSlide - 1, slideData, ...args.slice(2) as any);
  }
}

export function updateControls(
  slideData: Slide[],
  notesContentEls: HTMLElement[],
  nextSlidePreviewEls: HTMLElement[],
  pageNumberEl: HTMLElement,
  progressBar: HTMLElement,
  progressHandle: HTMLElement | null,
  prevBtn: HTMLButtonElement,
  nextBtn: HTMLButtonElement
) {
  pageNumberEl.textContent = `${state.currentSlide + 1}/${state.totalSlides}`;
  const pageInfoEls = document.querySelectorAll<HTMLElement>('.page-info');
  pageInfoEls.forEach(el => {
    el.textContent = `Page ${state.currentSlide + 1}`;
  });
  const progressPercentage = state.totalSlides > 1 ? (state.currentSlide / (state.totalSlides - 1)) * 100 : 0;
  progressBar.style.width = `${progressPercentage}%`;
  if (progressHandle) {
    progressHandle.style.left = `${progressPercentage}%`;
  }
  prevBtn.disabled = state.currentSlide === 0 && state.currentFragment === -1;
  nextBtn.disabled = state.currentSlide === state.totalSlides - 1 && state.currentFragment === state.slides[state.currentSlide].querySelectorAll('.fragment').length - 1;
  updateSpeakerNotes(slideData, notesContentEls, nextSlidePreviewEls);
}

export function updateSpeakerNotes(
  slideData: Slide[],
  notesContentEls: HTMLElement[],
  nextSlidePreviewEls: HTMLElement[]
) {
  const notesHTML = slideData[state.currentSlide] && slideData[state.currentSlide].notes ? slideData[state.currentSlide].notes! : 'このスライドにはノートがありません。';
  notesContentEls.forEach(el => {
    el.innerHTML = notesHTML;
  });

  nextSlidePreviewEls.forEach(previewEl => {
    if (state.currentSlide < state.totalSlides - 1) {
      const previewNode = state.slides[state.currentSlide + 1].cloneNode(true) as HTMLElement;
      previewNode.classList.remove('is-active', 'is-exiting');
      previewNode.style.opacity = '1';
      previewNode.style.transform = 'none';
      previewNode.style.position = 'absolute';
      previewNode.style.pointerEvents = 'none';
      previewNode.querySelectorAll('.fragment').forEach(f => f.classList.add('is-visible'));

      previewEl.innerHTML = '';
      previewEl.appendChild(previewNode);

      const previewRect = previewEl.getBoundingClientRect();
      const wrapperRect = document.getElementById('presentation-wrapper')!.getBoundingClientRect();
      const scale = Math.min(previewRect.width / wrapperRect.width, previewRect.height / wrapperRect.height);
      previewNode.style.width = `${wrapperRect.width}px`;
      previewNode.style.height = `${wrapperRect.height}px`;
      previewNode.style.transform = `scale(${scale})`;
    } else {
      previewEl.innerHTML = '<p style="text-align:center; color: var(--text-muted-color);">最後のスライドです</p>';
    }
  });
}

