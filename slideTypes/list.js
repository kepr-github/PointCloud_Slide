export function render(data, footer) {
  const listTag = data.ordered === false ? 'ul' : 'ol';
  const listItems = (data.content || [])
    .map(item => `<li ${item.jumpTo ? `data-jump-to="${item.jumpTo}"` : ''} class="${item.fragment ? 'fragment' : ''}">${item.text || item}</li>`)
    .join('');
  return `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content"><${listTag}>${listItems}</${listTag}></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
}
