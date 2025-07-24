export function render(data, footer) {
  const language = data.language || 'plaintext';
  const code = (data.code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content three-column"><div class="column"><h3>${data.subTitle || ''}</h3><p>${data.text || ''}</p></div><div class="column"><pre><code class="language-${language}">${code}</code></pre></div></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
}
