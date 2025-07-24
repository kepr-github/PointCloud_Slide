import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function handleKeyDown(
  e: KeyboardEvent,
  actions: { next: () => void; prev: () => void; toggleFullscreen: () => void; toggleSpeakerNotes: () => void; toggleLaser: () => void; exportPDF: () => void }
) {
  if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
  switch (e.key) {
    case 'ArrowRight':
    case ' ':
      actions.next();
      break;
    case 'ArrowLeft':
      actions.prev();
      break;
    case 'f':
      actions.toggleFullscreen();
      break;
    case 'n':
      actions.toggleSpeakerNotes();
      break;
    case 'l':
      actions.toggleLaser();
      break;
    case 'p':
      actions.exportPDF();
      break;
  }
}

export function toggleTheme(
  themes: string[],
  currentIndex: { value: number }
) {
  const oldTheme = themes[currentIndex.value];
  if (oldTheme) document.body.classList.remove(oldTheme);
  currentIndex.value = (currentIndex.value + 1) % themes.length;
  const newTheme = themes[currentIndex.value];
  if (newTheme) document.body.classList.add(newTheme);
  const lightThemes = ['theme-academic'];
  const isLight = lightThemes.includes(newTheme);
  (document.getElementById('hljs-theme-dark') as HTMLLinkElement).disabled = isLight;
  (document.getElementById('hljs-theme-light') as HTMLLinkElement).disabled = !isLight;
}

export function toggleLaser(laserPointer: HTMLElement) {
  laserPointer.classList.toggle('is-visible');
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => alert(`Fullscreen error: ${err.message}`));
  else if (document.exitFullscreen) document.exitFullscreen();
}

export async function exportPDF(
  slides: NodeListOf<HTMLElement>,
  presentation: HTMLElement,
  showSlide: (index: number) => void
) {
  if (!(window as any).jspdf || !html2canvas) {
    alert('PDF ライブラリの読み込みに失敗しました');
    return;
  }
  const { jsPDF } = (window as any).jspdf as typeof import('jspdf');
  const width = presentation.clientWidth;
  const height = presentation.clientHeight;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [width, height] });
  const originalSlide = 0;
  for (let i = 0; i < slides.length; i++) {
    showSlide(i);
    await new Promise(r => setTimeout(r, 800));
    if ((window as any).MathJax && typeof (window as any).MathJax.typesetPromise === 'function') {
      await (window as any).MathJax.typesetPromise();
    }
    const canvas = await html2canvas(slides[i], { useCORS: true, backgroundColor: null });
    const img = canvas.toDataURL('image/png');
    if (i > 0) pdf.addPage();
    pdf.addImage(img, 'PNG', 0, 0, width, height);
  }
  showSlide(originalSlide);
  pdf.save('slides.pdf');
}

export function handlePresentationClick(event: MouseEvent, showSlide: (index: number) => void) {
  const jumpTarget = (event.target as HTMLElement).closest('[data-jump-to]');
  if (jumpTarget) {
    const slideIndex = parseInt((jumpTarget as HTMLElement).dataset.jumpTo || '0', 10);
    showSlide(slideIndex);
    return;
  }
}
