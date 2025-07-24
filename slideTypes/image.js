export function render(data, footer) {
  if (data.listContent && data.listContent.length) {
    const listItems = data.listContent
      .map(item => `<li ${item.jumpTo ? `data-jump-to="${item.jumpTo}"` : ''} class="${item.fragment ? 'fragment' : ''}">${item.text || item}</li>`)
      .join('');
    return `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content two-column"><div class="column"><div class="image-slide-content"><img src="${data.imageSrc || ''}" alt="${data.title}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''}></div><p>${data.caption || ''}</p></div><div class="column"><ul>${listItems}</ul></div></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
  }
  return `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content"><div class="image-slide-content"><img src="${data.imageSrc || ''}" alt="${data.title}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''}></div><p>${data.caption || ''}</p><div>${data.math || ''}</div></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
}
