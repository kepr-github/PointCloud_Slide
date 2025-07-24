export function render(data, footer) {
  return `<div class="title-slide"><h1>${data.title}</h1><p class="author">${data.author}</p><p class="date">${data.date || ''}</p></div>`;
}
