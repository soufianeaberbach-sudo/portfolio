/** Image-backed reader: mounts one selected document, never a browser PDF plug-in. */
export function initTechPackReaders() {
  const closers = new WeakMap<HTMLElement, () => void>();
  for (const world of document.querySelectorAll<HTMLElement>('[data-world]')) {
    const dialog = world.querySelector<HTMLDialogElement>('[data-reader]');
    if (!dialog) continue;
    const mount = dialog.querySelector<HTMLElement>('[data-reader-mount]')!;
    let dispose = () => {};
    let opener: HTMLElement | null = null;
    const close = () => {
      if (dialog.hidden) return;
      dispose(); mount.replaceChildren(); dialog.close(); dialog.hidden = true;
      world.classList.remove('pf-world--reading');
      const scroll = Number(dialog.dataset.scrollTop || 0);
      opener?.focus({ preventScroll: true });
      const restore = () => { world.scrollTop = scroll; };
      restore(); requestAnimationFrame(() => { restore(); requestAnimationFrame(restore); });
      window.setTimeout(restore, 80);
    };
    closers.set(world, close);
    dialog.querySelector('[data-reader-close]')?.addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    for (const door of world.querySelectorAll<HTMLAnchorElement>('[data-open-pdf]')) {
      door.addEventListener('pointerdown', () => { dialog.dataset.scrollTop = String(world.scrollTop); });
      door.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const pages: string[] = JSON.parse(door.dataset.pageImages || '[]');
        if (!pages.length) return;
        event.preventDefault(); dispose(); opener = door;
        if (!event.detail) dialog.dataset.scrollTop = String(world.scrollTop);
        dialog.querySelector('[data-reader-title]')!.textContent = door.dataset.docTitle || '';
        for (const link of dialog.querySelectorAll<HTMLAnchorElement>('[data-reader-tab],[data-reader-download]')) {
          link.href = door.href;
          if (link.hasAttribute('data-reader-download')) link.download = door.pathname.split('/').pop()!;
        }
        dialog.hidden = false; dialog.showModal(); world.classList.add('pf-world--reading');
        dispose = mountDocument(mount, dialog, pages, JSON.parse(door.dataset.pagePreviews || '[]'), door.dataset.docTitle || 'Technical pack');
        dialog.querySelector<HTMLElement>('[data-reader-close]')?.focus({ preventScroll: true });
      });
    }
  }
  return (world: HTMLElement) => closers.get(world)?.();
}

function mountDocument(mount: HTMLElement, dialog: HTMLDialogElement, pages: string[], previews: string[], title: string) {
  const abort = new AbortController(), signal = abort.signal;
  const tools = document.createElement('div'); tools.className = 'tp-reader-tools'; tools.setAttribute('role', 'toolbar'); tools.setAttribute('aria-label', 'Document controls');
  tools.innerHTML = `<label>Page <input data-tp-page type="number" min="1" max="${pages.length}" value="1" aria-label="Go to page" inputmode="numeric"></label><span> / ${pages.length}</span><span class="tp-reader-tools__space"></span><button type="button" data-tp-out aria-label="Zoom out">−</button><output data-tp-zoom aria-label="Zoom level">100%</output><button type="button" data-tp-in aria-label="Zoom in">+</button><button type="button" data-tp-width>Fit width</button><button type="button" data-tp-fit>Fit page</button>`;
  const scroll = document.createElement('div'); scroll.className = 'tp-reader-scroll'; scroll.tabIndex = 0; scroll.setAttribute('aria-label', `${title}, ${pages.length} pages. Scroll to read; plus and minus to zoom, 0 to fit width.`);
  const stack = document.createElement('div'); stack.className = 'tp-reader-pages';
  const figures = pages.map((src, i) => {
    const figure = document.createElement('figure'); figure.className = 'tp-reader-page'; figure.dataset.page = String(i + 1);
    const img = document.createElement('img'); img.width = 3508; img.height = 2480; img.alt = `${title} — page ${i + 1} of ${pages.length}`; img.decoding = 'async';
    img.loading = i < 2 ? 'eager' : 'lazy'; img.dataset.src = src; img.dataset.preview = previews[i] || src;
    figure.setAttribute('aria-busy', 'true');

    const caption = document.createElement('figcaption'); caption.textContent = `Page ${i + 1} / ${pages.length}`;
    const error = document.createElement('p'); error.className = 'tp-reader-error'; error.hidden = true;
    const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Retry page';
    retry.addEventListener('click', () => { error.hidden = true; img.removeAttribute('srcset'); img.src = src; }, { signal });
    error.append('This page could not load. ', retry);
    img.addEventListener('error', () => { if (img.hasAttribute('src')) { error.hidden = false; figure.setAttribute('aria-busy', 'false'); } }, { signal });
    img.addEventListener('load', () => { error.hidden = true; figure.setAttribute('aria-busy', 'false'); }, { signal });
    figure.append(img, caption, error); stack.append(figure); return figure;
  });
  scroll.append(stack); mount.replaceChildren(tools, scroll);
  const pageInput = tools.querySelector<HTMLInputElement>('[data-tp-page]')!;
  const zoomOutput = tools.querySelector<HTMLOutputElement>('[data-tp-zoom]')!;
  let zoom = 1, current = 0, fit: 'width' | 'page' | null = 'width', raf = 0;
  const baseWidth = () => Math.max(100, scroll.clientWidth - (scroll.clientWidth < 600 ? 16 : 40));
  const apply = (next: number, x = scroll.clientWidth / 2, y = scroll.clientHeight / 2) => {
    const oldWidth = stack.getBoundingClientRect().width;
    const oldLeft = stack.offsetLeft;
    const relX = (scroll.scrollLeft + x - oldLeft) / oldWidth;
    const relY = (scroll.scrollTop + y - stack.offsetTop) / oldWidth;
    zoom = Math.max(.25, Math.min(5, next));
    const width = baseWidth() * zoom;
    stack.style.width = `${width}px`;
    stack.style.paddingBottom = `${Math.max(0, scroll.clientHeight - width * 2480 / 3508 - 24)}px`;
    for (const image of stack.querySelectorAll('img')) image.sizes = `${Math.ceil(width)}px`;
    scroll.dataset.zoomed = zoom > 1.01 ? 'true' : 'false'; scroll.dataset.zoom = zoom.toFixed(3);
    zoomOutput.value = `${Math.round(zoom * 100)}%`;
    scroll.scrollLeft = stack.offsetLeft + relX * width - x;
    scroll.scrollTop = stack.offsetTop + relY * width - y;
    tools.querySelector<HTMLButtonElement>('[data-tp-out]')!.disabled = zoom <= .25;
    tools.querySelector<HTMLButtonElement>('[data-tp-in]')!.disabled = zoom >= 5;
  };
  const goto = (n: number) => {
    current = Math.max(0, Math.min(pages.length - 1, n));
    scroll.scrollTop = figures[current].offsetTop; pageInput.value = String(current + 1);
  };
  const fitWidth = () => { fit = 'width'; apply(1); goto(current); scroll.scrollLeft = 0; };
  const fitPage = () => { fit = 'page'; apply(Math.min(1, (scroll.clientHeight - 48) / (baseWidth() * 2480 / 3508))); goto(current); scroll.scrollLeft = 0; };
  tools.querySelector('[data-tp-width]')!.addEventListener('click', fitWidth, { signal });
  tools.querySelector('[data-tp-fit]')!.addEventListener('click', fitPage, { signal });
  const change = (factor: number) => { fit = null; apply(zoom * factor); };
  tools.querySelector('[data-tp-in]')!.addEventListener('click', () => change(1.25), { signal });
  tools.querySelector('[data-tp-out]')!.addEventListener('click', () => change(1 / 1.25), { signal });
  pageInput.addEventListener('change', () => goto(Number(pageInput.value) - 1 || 0), { signal });
  scroll.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; const y = scroll.scrollTop + Math.min(scroll.clientHeight * .3, 150);
      let index = 0; for (let i = 0; i < figures.length; i++) if (figures[i].offsetTop <= y) index = i;
      current = index; if (document.activeElement !== pageInput) pageInput.value = String(index + 1);
    });
  }, { signal, passive: true });
  scroll.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); change(1.25); }
    else if (event.key === '-') { event.preventDefault(); change(.8); }
    else if (event.key === '0') { event.preventDefault(); fitWidth(); }
    else if (event.key === 'Home') { event.preventDefault(); goto(0); }
    else if (event.key === 'End') { event.preventDefault(); goto(pages.length - 1); }
    else if (event.key === 'PageDown' || event.key === 'PageUp') { event.preventDefault(); goto(current + (event.key === 'PageDown' ? 1 : -1)); }
  }, { signal });
  scroll.addEventListener('wheel', event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault(); fit = null; const r = scroll.getBoundingClientRect(); apply(zoom * Math.exp(-event.deltaY * .01), event.clientX - r.left, event.clientY - r.top);
  }, { signal, passive: false });
  let mouse: { x: number; y: number; left: number; top: number } | null = null;
  scroll.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || zoom <= 1.01) return;
    mouse = { x: event.clientX, y: event.clientY, left: scroll.scrollLeft, top: scroll.scrollTop }; scroll.setPointerCapture(event.pointerId); event.preventDefault();
  }, { signal });
  scroll.addEventListener('pointermove', event => { if (mouse) { scroll.scrollLeft = mouse.left + mouse.x - event.clientX; scroll.scrollTop = mouse.top + mouse.y - event.clientY; } }, { signal });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) scroll.addEventListener(type, () => { mouse = null; }, { signal });
  let gesture: { distance: number; zoom: number; x: number; y: number; left: number; top: number } | null = null;
  const distance = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  scroll.addEventListener('touchstart', event => {
    if (event.touches.length === 2) { gesture = { distance: distance(event.touches), zoom, x: 0, y: 0, left: 0, top: 0 }; event.preventDefault(); }
    else if (zoom > 1.01) { const t = event.touches[0]; gesture = { distance: 0, zoom, x: t.clientX, y: t.clientY, left: scroll.scrollLeft, top: scroll.scrollTop }; }
  }, { signal, passive: false });
  scroll.addEventListener('touchmove', event => {
    if (!gesture) return;
    if (event.touches.length === 2 && gesture.distance) {
      event.preventDefault(); fit = null; const r = scroll.getBoundingClientRect(); apply(gesture.zoom * distance(event.touches) / gesture.distance, (event.touches[0].clientX + event.touches[1].clientX) / 2 - r.left, (event.touches[0].clientY + event.touches[1].clientY) / 2 - r.top);
    } else if (event.touches.length === 1 && !gesture.distance && zoom > 1.01) {
      event.preventDefault(); scroll.scrollLeft = gesture.left + gesture.x - event.touches[0].clientX; scroll.scrollTop = gesture.top + gesture.y - event.touches[0].clientY;
    }
  }, { signal, passive: false });
  scroll.addEventListener('touchend', () => { gesture = null; }, { signal });
  scroll.addEventListener('touchcancel', () => { gesture = null; }, { signal });
  const resize = new ResizeObserver(() => { if (fit === 'page') fitPage(); else if (fit === 'width') fitWidth(); else apply(zoom); });
  resize.observe(scroll); apply(1, 0, 0);
  // Limit active high-resolution images to the viewport and a short reading buffer.
  // Unloaded pages retain their exact geometry; returning reuses the browser's HTTP cache.
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const image = entry.target.querySelector('img')!;
      if (entry.isIntersecting) {
        if (!image.hasAttribute('src')) { entry.target.setAttribute('aria-busy', 'true'); image.srcset = `${image.dataset.preview} 1600w, ${image.dataset.src} 3508w`; image.src = image.dataset.preview!; }
      } else {
        image.removeAttribute('srcset'); image.removeAttribute('src'); entry.target.querySelector<HTMLElement>('.tp-reader-error')!.hidden = true;
      }
    }
  }, { root: scroll, rootMargin: `${Math.min(300, Math.round(scroll.clientHeight * .4))}px 0px` });
  figures.forEach(figure => visibility.observe(figure));
  return () => { abort.abort(); visibility.disconnect(); resize.disconnect(); cancelAnimationFrame(raf); for (const image of stack.querySelectorAll('img')) { image.removeAttribute('srcset'); image.removeAttribute('src'); } };
}
