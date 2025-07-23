        // --- プレゼンテーションエンジンのロジック ---
        document.addEventListener('DOMContentLoaded', () => {
            const presentation = document.getElementById('presentation');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const notesBtn = document.getElementById('notes-btn');
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            const themeBtn = document.getElementById('theme-btn');
            const laserBtn = document.getElementById('laser-btn');
            const closeNotesBtn = document.getElementById('close-notes-btn');
            const pageNumberEl = document.getElementById('page-number');
            const progressBar = document.getElementById('progress-bar');
            const progressBarContainer = document.getElementById('progress-bar-container');
            const notesWindow = document.getElementById('speaker-notes-window');
            const notesContent = document.getElementById('notes-content');
            const laserPointer = document.getElementById('laser-pointer');
            const timeElapsedEl = document.getElementById('timer-elapsed');
           const timeCurrentEl = document.getElementById('timer-current');
           const nextSlidePreviewEl = document.getElementById('next-slide-preview');
            const timerResetBtn = document.getElementById('timer-reset-btn');

            // Elements for optional external speaker notes window
            let externalNotesWindow = null;
            const notesContentEls = [notesContent];
            const nextSlidePreviewEls = [nextSlidePreviewEl];
            const timeElapsedEls = [timeElapsedEl];
            const timeCurrentEls = [timeCurrentEl];
            const lightboxOverlay = document.getElementById('lightbox-overlay');
            const lightboxContent = document.getElementById('lightbox-content');
            const fileInputsContainer = document.getElementById('file-inputs');
            
            let currentSlide = 0;
            let currentFragment = -1;
            let totalSlides = 0;
            let isTransitioning = false;
            let slides = [];
            let startTime = new Date();
            let timerInterval;
            let threeJSInstances = {};
            let isDraggingProgress = false;

            function updatePresentationSize() {
                const wrapper = document.getElementById('presentation-wrapper');
                const maxWidth = window.innerWidth * 0.9;
                const maxHeight = window.innerHeight * 0.9;
                let width = maxWidth;
                let height = width * 9 / 16;
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * 16 / 9;
                }
                wrapper.style.width = `${width}px`;
                wrapper.style.height = `${height}px`;

                // Scale base font size relative to the presentation width so
                // that text scales proportionally with the window size.
                const baseWidth = 1280; // design width used for styling
                const scale = width / baseWidth;
                const fontScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
                const fontSize = 16 * scale * fontScale;
                document.documentElement.style.fontSize = `${fontSize}px`;
            }

            function generateSlides() {
                totalSlides = slideData.length;
                let slideHTML = '';
                let fileInputHTML = '';

                slideData.forEach((data, index) => {
                    let contentHTML = '';
                    // ファイル入力が必要なスライドのためにinput要素を準備
                    if (data.fileInputId) {
                        fileInputHTML += `<input type="file" id="${data.fileInputId}" />`;
                    }

                    switch (data.type) {
                        case 'title':
                            contentHTML = `<div class="title-slide"><h1>${data.title}</h1><p class="author">${data.author}</p><p class="date">${data.date}</p></div>`;
                            break;
                        case 'list':
                            const listItems = data.content.map(item => `<li ${item.jumpTo ? `data-jump-to="${item.jumpTo}"` : ''} class="${item.fragment ? 'fragment' : ''}">${item.text || item}</li>`).join('');
                            contentHTML = `<header class="slide-header">${data.header}</header><h2>${data.title}</h2><div class="slide-content"><ol>${listItems}</ol></div><footer class="slide-footer"><span>${data.footerText}</span><span class="page-info"></span></footer>`;
                            break;
                        case 'code':
                             contentHTML = `<header class="slide-header">${data.header}</header><h2>${data.title}</h2><div class="slide-content three-column"><div class="column"><h3>${data.subTitle}</h3><p>${data.text}</p></div><div class="column"><pre ${data.zoomable ? 'class="zoomable"' : ''}><code class="language-${data.language || 'plaintext'}">${data.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></div></div><footer class="slide-footer"><span>${data.footerText}</span><span class="page-info"></span></footer>`;
                            break;
                        case 'image':
                             contentHTML = `<header class="slide-header">${data.header}</header><h2>${data.title}</h2><div class="slide-content"><div class="image-slide-content"><img src="${data.imageSrc || ''}" alt="${data.title}" ${data.zoomable ? 'class="zoomable"' : ''} ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''}></div><p>${data.caption || ''}</p><div>${data.math || ''}</div></div><footer class="slide-footer"><span>${data.footerText}</span><span class="page-info"></span></footer>`;
                            break;
                        case 'video':
                             let videoSrc = data.videoId ? `https://www.youtube.com/embed/${data.videoId}` : '';
                             contentHTML = `<header class="slide-header">${data.header}</header><h2>${data.title}</h2><div class="slide-content"><div class="video-slide-content"><${data.videoId ? 'iframe' : 'video'} src="${videoSrc}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''} ${!data.videoId ? 'controls' : ''} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></${data.videoId ? 'iframe' : 'video'}></div><p>${data.caption || ''}</p></div><footer class="slide-footer"><span>${data.footerText}</span><span class="page-info"></span></footer>`;
                            break;
                        case 'pointCloud':
                            contentHTML = `<header class="slide-header">${data.header}</header><h2>${data.title}</h2><div class="slide-content point-cloud-container ${data.zoomable ? 'zoomable' : ''}" data-slide-index="${index}"><canvas class="point-cloud-canvas" data-points="${data.points || 0}" data-use-vertex-colors="${data.useVertexColors || false}" ${data.fileInputId ? `data-file-input-id="${data.fileInputId}"` : ''}></canvas></div><p style="text-align: center;">${data.caption}</p><footer class="slide-footer"><span>${data.footerText}</span><span class="page-info"></span></footer>`;
                            break;
                        case 'end':
                            contentHTML = `<div class="end-slide"><h1>${data.title}</h1></div>`;
                            break;
                    }
                    slideHTML += `<div class="slide" data-index="${index}">${contentHTML}</div>`;
                });

                presentation.innerHTML = slideHTML;
                fileInputsContainer.innerHTML = fileInputHTML;
                slides = document.querySelectorAll('.slide');
                hljs.highlightAll();
            }
            
            function showSlide(newIndex, newFragment = -1) {
                if (isTransitioning || newIndex < 0 || newIndex >= totalSlides) return;
                
                const oldSlideIndex = currentSlide;
                currentSlide = newIndex;
                currentFragment = newFragment;

                if (newIndex !== oldSlideIndex) {
                    isTransitioning = true;
                    const oldSlideEl = slides[oldSlideIndex];
                    const newSlideEl = slides[newIndex];

                    if(oldSlideEl) oldSlideEl.classList.add('is-exiting');
                    if(newSlideEl) newSlideEl.classList.add('is-active');
                    
                    if (threeJSInstances[oldSlideIndex]) {
                        cancelAnimationFrame(threeJSInstances[oldSlideIndex].animationId);
                        delete threeJSInstances[oldSlideIndex];
                    }
                    const canvas = newSlideEl.querySelector('.point-cloud-canvas');
                    if (canvas) {
                        initPointCloud(canvas, newIndex);
                    }

                    setTimeout(() => {
                        if(oldSlideEl) oldSlideEl.classList.remove('is-active', 'is-exiting');
                        isTransitioning = false;
                    }, 800);
                }

                const fragments = slides[currentSlide].querySelectorAll('.fragment');
                fragments.forEach((fragment, i) => {
                    fragment.classList.toggle('is-visible', i <= currentFragment);
                });

                if (history.pushState) {
                    history.pushState(null, null, `#slide=${currentSlide}`);
                }
                updateControls();
                if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
                    MathJax.typesetPromise();
                }
            }

            function next() {
                const fragments = slides[currentSlide].querySelectorAll('.fragment');
                if (currentFragment < fragments.length - 1) {
                    currentFragment++;
                    showSlide(currentSlide, currentFragment);
                } else if (currentSlide < totalSlides - 1) {
                    showSlide(currentSlide + 1);
                }
            }

            function prev() {
                const fragments = slides[currentSlide].querySelectorAll('.fragment');
                if (currentFragment > -1) {
                    currentFragment--;
                    showSlide(currentSlide, currentFragment);
                } else if (currentSlide > 0) {
                    const prevSlideFragments = slides[currentSlide - 1].querySelectorAll('.fragment');
                    showSlide(currentSlide - 1, prevSlideFragments.length - 1);
                }
            }

            function updateControls() {
                pageNumberEl.textContent = `${currentSlide + 1} / ${totalSlides}`;
                const pageInfoEls = document.querySelectorAll('.page-info');
                pageInfoEls.forEach(el => { el.textContent = `Page ${currentSlide + 1}`; });
                const progressPercentage = totalSlides > 1 ? (currentSlide / (totalSlides - 1)) * 100 : 0;
                progressBar.style.width = `${progressPercentage}%`;
                prevBtn.disabled = (currentSlide === 0 && currentFragment === -1);
                nextBtn.disabled = (currentSlide === totalSlides - 1 && currentFragment === slides[currentSlide].querySelectorAll('.fragment').length - 1);
                updateSpeakerNotes();
            }

            function updateSpeakerNotes() {
                const notesHTML = (slideData[currentSlide] && slideData[currentSlide].notes)
                    ? slideData[currentSlide].notes
                    : 'このスライドにはノートがありません。';
                notesContentEls.forEach(el => { el.innerHTML = notesHTML; });

                nextSlidePreviewEls.forEach(previewEl => {
                    if (currentSlide < totalSlides - 1) {
                        const previewNode = slides[currentSlide + 1].cloneNode(true);
                        previewNode.classList.remove('is-active', 'is-exiting');
                        previewNode.style.opacity = '1';
                        previewNode.style.transform = 'none';
                        previewNode.style.position = 'relative';
                        previewNode.style.pointerEvents = 'none';
                        previewNode.querySelectorAll('.fragment').forEach(f => f.classList.add('is-visible'));

                        previewEl.innerHTML = '';
                        previewEl.appendChild(previewNode);

                        const previewRect = previewEl.getBoundingClientRect();
                        const slideRect = previewNode.getBoundingClientRect();
                        const scale = Math.min(previewRect.width / slideRect.width, previewRect.height / slideRect.height);
                        previewNode.style.transform = `scale(${scale})`;
                    } else {
                        previewEl.innerHTML = '<p style="text-align:center; color: var(--text-muted-color);">最後のスライドです</p>';
                    }
                });
            }

            function startTimers() {
                timerInterval = setInterval(() => {
                    const now = new Date();
                    const elapsed = new Date(now - startTime);
                    const minutes = String(elapsed.getUTCMinutes()).padStart(2, '0');
                    const seconds = String(elapsed.getUTCSeconds()).padStart(2, '0');
                    timeElapsedEls.forEach(el => { el.textContent = `${minutes}:${seconds}`; });
                    timeCurrentEls.forEach(el => { el.textContent = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }); });
                }, 1000);
            }

            function resetTimer() {
                startTime = new Date();
                timeElapsedEls.forEach(el => { el.textContent = '00:00'; });
            }
            
            function initPointCloud(canvas, slideIndex, isModal = false) {
                if (!isModal && threeJSInstances[slideIndex]) return;

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
                renderer.setPixelRatio(window.devicePixelRatio);

                const controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;

                const pointsCount = parseInt(canvas.dataset.points) || 0;
                const useVertexColors = canvas.dataset.useVertexColors === 'true';
                
                const vertices = slideData[slideIndex].pointData?.vertices || [];
                const colors = slideData[slideIndex].pointData?.colors || [];

                if (pointsCount > 0 && vertices.length === 0) {
                     for (let i = 0; i < pointsCount; i++) {
                        const x = (Math.random() - 0.5) * 2;
                        const y = (Math.random() - 0.5) * 2;
                        const z = (Math.random() - 0.5) * 2;
                        const d = 1 / Math.sqrt(x*x + y*y + z*z);
                        vertices.push(x*d, y*d, z*d);

                        if (useVertexColors) {
                            const color = new THREE.Color();
                            color.setHSL(0.5 + y * 0.2, 1.0, 0.5);
                            colors.push(color.r, color.g, color.b);
                        }
                    }
                }

                const geometry = new THREE.BufferGeometry();
                if (vertices.length > 0) {
                    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                    if (useVertexColors && colors.length > 0) {
                        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                    }
                }

                const material = new THREE.PointsMaterial({ size: 0.015, vertexColors: useVertexColors });
                if (!useVertexColors) {
                    material.color.set(0x00bfff);
                }
                
                const points = new THREE.Points(geometry, material);
                scene.add(points);

                camera.position.z = 1.5;

                let animationId;
                function animate() {
                    animationId = requestAnimationFrame(animate);
                    points.rotation.y += 0.0005;
                    controls.update();
                    renderer.render(scene, camera);
                }
                animate();

                if (!isModal) {
                    threeJSInstances[slideIndex] = { animationId, camera, renderer, canvas };
                }
            }
            
            function setupFileInputs() {
                slides.forEach((slide, index) => {
                    const fileInputId = slide.querySelector('[data-file-input-id]')?.dataset.fileInputId;
                    if (!fileInputId) return;

                    const inputEl = document.getElementById(fileInputId);
                    if (inputEl) {
                        inputEl.addEventListener('change', (event) => {
                            const file = event.target.files[0];
                            if (!file) return;

                            const reader = new FileReader();
                            const slideDataEntry = slideData[index];
                            
                            if (slideDataEntry.type === 'image' || (slideDataEntry.type === 'video' && !slideDataEntry.videoId)) {
                                reader.onload = (e) => {
                                    const targetEl = slide.querySelector(`[data-file-input-id="${fileInputId}"]`);
                                    targetEl.src = e.target.result;
                                };
                                reader.readAsDataURL(file);
                            } else if (slideDataEntry.type === 'pointCloud') {
                                reader.onload = (e) => {
                                    const text = e.target.result;
                                    const vertices = [];
                                    const colors = [];
                                    const lines = text.split('\n');
                                    lines.forEach(line => {
                                        const parts = line.split(',').map(Number);
                                        if (parts.length >= 3) {
                                            vertices.push(parts[0], parts[1], parts[2]);
                                            if (parts.length >= 6) {
                                                colors.push(parts[3], parts[4], parts[5]);
                                            }
                                        }
                                    });
                                    slideDataEntry.pointData = { vertices, colors };
                                    initPointCloud(slide.querySelector('.point-cloud-canvas'), index);
                                };
                                reader.readAsText(file);
                            }
                        });
                        // 初回表示時にファイル選択を促す
                        if (currentSlide === index) {
                            inputEl.click();
                        }
                    }
                });
            }

            function handleKeyDown(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                switch (e.key) {
                    case 'ArrowRight':
                    case ' ': next(); break;
                    case 'ArrowLeft': prev(); break;
                    case 'f': toggleFullscreen(); break;
                    case 'n': toggleSpeakerNotes(); break;
                    case 'l': toggleLaser(); break;
                    case 'Escape': closeLightbox(); break;
                }
            }

            function openExternalSpeakerNotes() {
                if (externalNotesWindow && !externalNotesWindow.closed) {
                    externalNotesWindow.focus();
                    return;
                }
                externalNotesWindow = window.open('', 'speaker-notes', 'width=900,height=700');
                if (!externalNotesWindow) return;
                const notesHTML = notesWindow.outerHTML.replace('is-hidden', '');
                externalNotesWindow.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>Speaker Notes</title><link rel="stylesheet" href="style.css"></head><body>` + notesHTML + `</body></html>`);
                externalNotesWindow.document.close();

                const extNotesContent = externalNotesWindow.document.getElementById('notes-content');
                const extNextPreview = externalNotesWindow.document.getElementById('next-slide-preview');
               const extElapsed = externalNotesWindow.document.getElementById('timer-elapsed');
               const extCurrent = externalNotesWindow.document.getElementById('timer-current');
                const extReset = externalNotesWindow.document.getElementById('timer-reset-btn');
                externalNotesWindow.document.getElementById('close-notes-btn').addEventListener('click', toggleSpeakerNotes);
                if (extReset) extReset.addEventListener('click', resetTimer);
                externalNotesWindow.addEventListener('keydown', handleKeyDown);
                externalNotesWindow.document.addEventListener('keydown', handleKeyDown);

                notesContentEls.push(extNotesContent);
                nextSlidePreviewEls.push(extNextPreview);
                timeElapsedEls.push(extElapsed);
                timeCurrentEls.push(extCurrent);

                externalNotesWindow.addEventListener('resize', () => {
                    updateSpeakerNotes();
                });

                externalNotesWindow.addEventListener('beforeunload', () => {
                    notesContentEls.splice(notesContentEls.indexOf(extNotesContent), 1);
                    nextSlidePreviewEls.splice(nextSlidePreviewEls.indexOf(extNextPreview), 1);
                    timeElapsedEls.splice(timeElapsedEls.indexOf(extElapsed), 1);
                    timeCurrentEls.splice(timeCurrentEls.indexOf(extCurrent), 1);
                    externalNotesWindow.removeEventListener('keydown', handleKeyDown);
                    externalNotesWindow.document.removeEventListener('keydown', handleKeyDown);
                    externalNotesWindow = null;
                });

                updateSpeakerNotes();
            }

            function toggleSpeakerNotes() {
                if (externalNotesWindow && !externalNotesWindow.closed) {
                    externalNotesWindow.close();
                } else {
                    openExternalSpeakerNotes();
                }
            }

            function updateSlideFromProgressEvent(e) {
                const rect = progressBarContainer.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                let ratio = (clientX - rect.left) / rect.width;
                ratio = Math.max(0, Math.min(1, ratio));
                const newIndex = Math.round(ratio * (totalSlides - 1));
                showSlide(newIndex);
            }

            function progressDragStart(e) {
                isDraggingProgress = true;
                updateSlideFromProgressEvent(e);
                document.addEventListener('mousemove', progressDragMove);
                document.addEventListener('touchmove', progressDragMove);
                document.addEventListener('mouseup', progressDragEnd);
                document.addEventListener('touchend', progressDragEnd);
            }

            function progressDragMove(e) {
                if (!isDraggingProgress) return;
                updateSlideFromProgressEvent(e);
            }

            function progressDragEnd(e) {
                if (!isDraggingProgress) return;
                isDraggingProgress = false;
                updateSlideFromProgressEvent(e);
                document.removeEventListener('mousemove', progressDragMove);
                document.removeEventListener('touchmove', progressDragMove);
                document.removeEventListener('mouseup', progressDragEnd);
                document.removeEventListener('touchend', progressDragEnd);
            }
            function toggleTheme() {
                document.body.classList.toggle('theme-academic');
                const isAcademic = document.body.classList.contains('theme-academic');
                document.getElementById('hljs-theme-dark').disabled = isAcademic;
                document.getElementById('hljs-theme-light').disabled = !isAcademic;
            }
            function toggleLaser() { laserPointer.classList.toggle('is-visible'); }
            function toggleFullscreen() {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => alert(`Fullscreen error: ${err.message}`));
                else if (document.exitFullscreen) document.exitFullscreen();
            }
            function handlePresentationClick(event) {
                const jumpTarget = event.target.closest('[data-jump-to]');
                if (jumpTarget) {
                    const slideIndex = parseInt(jumpTarget.dataset.jumpTo, 10);
                    showSlide(slideIndex);
                    return;
                }

                const zoomTarget = event.target.closest('.zoomable');
                if (zoomTarget) {
                    openLightbox(zoomTarget);
                }
            }
            function getStartSlideFromURL() {
                const hash = window.location.hash;
                if (hash.startsWith('#slide=')) {
                    const slideNum = parseInt(hash.substring(7), 10);
                    if (!isNaN(slideNum) && slideNum >= 0 && slideNum < totalSlides) return slideNum;
                }
                return 0;
            }

            function openLightbox(element) {
                lightboxContent.innerHTML = '';
                let canvas = null;
                let slideIndex = null;
                if (element.classList.contains('point-cloud-container')) {
                    canvas = document.createElement('canvas');
                    canvas.className = 'point-cloud-canvas';
                    lightboxContent.appendChild(canvas);
                    slideIndex = parseInt(element.dataset.slideIndex, 10);
                } else {
                    const clone = element.cloneNode(true);
                    lightboxContent.appendChild(clone);
                    if (clone.tagName === 'PRE') {
                        hljs.highlightElement(clone.querySelector('code'));
                    }
                }
                lightboxOverlay.classList.add('is-visible');
                if (canvas && slideIndex !== null) {
                    requestAnimationFrame(() => {
                        initPointCloud(canvas, slideIndex, true);
                    });
                }
            }

            function closeLightbox() {
                lightboxOverlay.classList.remove('is-visible');
                lightboxContent.innerHTML = ''; // 3Dインスタンスなどを破棄
            }

            function handleKeyDown(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                switch(e.key) {
                    case 'ArrowRight':
                    case ' ':
                        next();
                        break;
                    case 'ArrowLeft':
                        prev();
                        break;
                    case 'f':
                        toggleFullscreen();
                        break;
                    case 'n':
                        toggleSpeakerNotes();
                        break;
                    case 'l':
                        toggleLaser();
                        break;
                    case 'Escape':
                        closeLightbox();
                        break;
                }
            }
            
            function init() {
                generateSlides();
                setupFileInputs();
                updatePresentationSize();
                
                nextBtn.addEventListener('click', next);
                prevBtn.addEventListener('click', prev);
                notesBtn.addEventListener('click', toggleSpeakerNotes);
                closeNotesBtn.addEventListener('click', toggleSpeakerNotes);
                fullscreenBtn.addEventListener('click', toggleFullscreen);
                themeBtn.addEventListener('click', toggleTheme);
                laserBtn.addEventListener('click', toggleLaser);
                timerResetBtn.addEventListener('click', resetTimer);
                presentation.addEventListener('click', handlePresentationClick);
                lightboxOverlay.addEventListener('click', closeLightbox);
                progressBarContainer.addEventListener('mousedown', progressDragStart);
                progressBarContainer.addEventListener('touchstart', progressDragStart);


                // フルスクリーン状態の変更時にもサイズを再計算する
                document.addEventListener('fullscreenchange', () => {
                    updatePresentationSize();
                    updateSpeakerNotes();
                });

                document.addEventListener('keydown', (e) => {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                    switch(e.key) {
                        case 'ArrowRight': case ' ': next(); break;
                        case 'ArrowLeft': prev(); break;
                        case 'f': toggleFullscreen(); break;
                        case 'n': toggleSpeakerNotes(); break;
                        case 'l': toggleLaser(); break;
                        case 'Escape': closeLightbox(); break;
                    }
                });



                document.addEventListener('mousemove', (e) => {
                    laserPointer.style.left = `${e.clientX}px`;
                    laserPointer.style.top = `${e.clientY}px`;
                });

                window.addEventListener('hashchange', () => {
                    const slideNum = getStartSlideFromURL();
                    if (slideNum !== currentSlide) {
                        showSlide(slideNum);
                    }
                });

                window.addEventListener('resize', () => {
                    updatePresentationSize();
                    updateSpeakerNotes();
                    Object.values(threeJSInstances).forEach(instance => {
                        if (instance && instance.camera && instance.renderer && instance.canvas) {
                            const { camera, renderer, canvas } = instance;
                            const newWidth = canvas.clientWidth;
                            const newHeight = canvas.clientHeight;
                            if (newWidth > 0 && newHeight > 0) {
                                camera.aspect = newWidth / newHeight;
                                camera.updateProjectionMatrix();
                                renderer.setSize(newWidth, newHeight);
                            }
                        }
                    });
                });

                const startSlide = getStartSlideFromURL();
                showSlide(startSlide);
                startTimers();
            }

                fetch("slides.yaml")
                    .then(res => res.text())
                    .then(text => {
                        const yamlData = jsyaml.load(text);
                        slideData = [...(yamlData.editableSlides || []), ...(yamlData.fixedSlides || [])];
                        init();
                    })
                    .catch(err => {
                        console.error("failed to load slides.yaml", err);
                        init();
                    });
        });
