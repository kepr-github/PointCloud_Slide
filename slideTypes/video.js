export function render(data, footer) {
  const isYouTube = !!data.videoId && !data.videoSrc;
  const videoSrc = data.videoSrc || (isYouTube ? `https://www.youtube.com/embed/${data.videoId}` : '');
  return `<header class="slide-header">${data.header || ''}</header><h2>${data.title}</h2><div class="slide-content"><div class="video-slide-content"><${isYouTube ? 'iframe' : 'video'} src="${videoSrc}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''} ${!isYouTube ? 'controls' : ''} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></${isYouTube ? 'iframe' : 'video'}></div><p>${data.caption || ''}</p></div><footer class="slide-footer"><span>${footer}</span><span class="page-info"></span></footer>`;
}
