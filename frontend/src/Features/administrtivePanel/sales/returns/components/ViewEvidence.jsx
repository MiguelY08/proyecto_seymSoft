import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

const DESCRIPTION_PREVIEW_LIMIT = 180;

const getEvidenceImageUrl = (evidence) => evidence?.imageUrl || evidence?.image_path || evidence?.preview || evidence?.url || '';

const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image') || imageUrl.startsWith('blob:')) return imageUrl;
  return new URL(imageUrl, window.location.origin).href;
};

const getFileName = (url) => {
  if (!url) return 'evidencia.jpg';
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return decodeURIComponent(filename.split('?')[0] || 'evidencia.jpg');
};

const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const buildEvidenceViewerHtml = ({ title, evidences, initialIndex }) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #1f2937;
      background: linear-gradient(135deg, #e9f2f7 0%, #f8fbfd 46%, #eef6fa 100%);
    }
    .viewer { min-height: 100vh; display: flex; flex-direction: column; }
    .header {
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #003b5c 0%, #004D77 58%, #0877a8 100%);
      color: white;
      padding: 14px clamp(16px, 3.2vw, 42px);
      box-shadow: 0 16px 35px rgba(0, 77, 119, .22);
    }
    .header::before, .header::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      background: rgba(255,255,255,.1);
      pointer-events: none;
    }
    .header::before { width: 180px; height: 180px; right: -54px; top: -92px; }
    .header::after { width: 120px; height: 120px; right: 15%; bottom: -82px; background: rgba(125, 211, 252, .12); }
    .header-content { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .title-wrap { min-width: 0; display: flex; align-items: center; gap: 12px; }
    .icon {
      width: 42px; height: 42px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: 14px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2);
    }
    h1 { margin: 0; font-size: clamp(1.05rem, 2.2vw, 1.55rem); line-height: 1.1; letter-spacing: -.02em; overflow-wrap: anywhere; }
    .subtitle { margin-top: 4px; color: rgba(255,255,255,.78); font-size: .8rem; }
    .close {
      border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.12); color: white;
      border-radius: 999px; min-width: 38px; height: 38px; cursor: pointer; font-size: 22px; transition: .18s ease;
    }
    .close:hover { background: rgba(255,255,255,.22); transform: translateY(-1px); }
    .stage {
      width: min(1180px, calc(100vw - 28px));
      margin: clamp(12px, 2.4vw, 24px) auto;
      flex: 1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
      gap: 16px;
      min-height: 0;
    }
    .image-card, .info-card {
      border: 1px solid rgba(0,77,119,.12);
      border-radius: 24px;
      background: rgba(255,255,255,.92);
      box-shadow: 0 18px 45px rgba(15, 23, 42, .08);
      overflow: hidden;
    }
    .image-card { position: relative; display: grid; grid-template-rows: minmax(320px, 1fr) auto; min-height: 560px; }
    .image-area {
      position: relative;
      display: grid;
      place-items: center;
      padding: 18px;
      background: radial-gradient(circle at center, rgba(0,77,119,.06), transparent 45%), linear-gradient(180deg, #f8fbfd 0%, #eef5f9 100%);
      overflow: hidden;
    }
    .main-image {
      max-width: 100%;
      max-height: 64vh;
      object-fit: contain;
      border-radius: 18px;
      box-shadow: 0 16px 35px rgba(15, 23, 42, .18);
      background: white;
      cursor: zoom-in;
    }
    .zoom-lens {
      position: absolute;
      width: 190px;
      height: 190px;
      border-radius: 999px;
      border: 3px solid rgba(255, 255, 255, .95);
      outline: 1px solid rgba(0, 77, 119, .2);
      box-shadow: 0 18px 42px rgba(15, 23, 42, .28);
      background-repeat: no-repeat;
      background-color: white;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%) scale(.96);
      transition: opacity .12s ease, transform .12s ease;
      z-index: 5;
    }
    .zoom-lens.visible { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    .empty { text-align: center; color: #94a3b8; font-weight: 800; }
    .nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 48px; height: 48px; border-radius: 999px; border: 1px solid rgba(0,77,119,.16);
      background: rgba(255,255,255,.94); color: #004D77; font-size: 30px; line-height: 1;
      cursor: pointer; display: grid; place-items: center; box-shadow: 0 10px 22px rgba(15,23,42,.14); transition: .18s ease;
    }
    .nav:hover { transform: translateY(-50%) scale(1.06); background: #e8f3f8; }
    .prev { left: 18px; } .next { right: 18px; }
    .thumbs {
      display: flex; gap: 10px; overflow-x: auto; padding: 12px;
      border-top: 1px solid #e2e8f0; background: white;
    }
    .thumb {
      width: 64px; height: 64px; padding: 0; flex: 0 0 auto;
      border-radius: 14px; border: 2px solid transparent; background: #f1f5f9;
      overflow: hidden; cursor: pointer; opacity: .72; transition: .18s ease;
    }
    .thumb:hover { opacity: 1; transform: translateY(-2px); }
    .thumb.active { opacity: 1; border-color: #004D77; box-shadow: 0 8px 18px rgba(0,77,119,.18); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .info-card { display: flex; flex-direction: column; min-height: 0; }
    .info-main { padding: 20px; overflow: auto; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px; border-radius: 999px;
      background: #e8f3f8; color: #004D77; padding: 7px 11px; font-weight: 800; font-size: .8rem;
    }
    .name { margin: 16px 0 6px; font-size: 1.02rem; font-weight: 800; overflow-wrap: anywhere; }
    .description-title { margin: 18px 0 8px; color: #94a3b8; font-size: .74rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
    .description {
      min-height: 135px; border-radius: 16px; border: 1px solid #dbe7ef; background: #f8fbfd;
      padding: 14px; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word;
      line-height: 1.5; color: #475569; font-size: .92rem;
    }
    .actions { display: grid; gap: 10px; padding: 14px 20px 20px; border-top: 1px solid #e2e8f0; background: white; }
    .btn {
      width: 100%; border: 1px solid #004D77; border-radius: 999px; padding: 11px 15px;
      font-weight: 800; cursor: pointer; transition: .18s ease;
    }
    .btn-primary { background: #004D77; color: white; }
    .btn-primary:hover { background: #003b5c; transform: translateY(-1px); }
    .btn-secondary { background: white; color: #004D77; }
    .btn-secondary:hover { background: #e8f3f8; transform: translateY(-1px); }
    @media (max-width: 820px) {
      .stage { grid-template-columns: 1fr; width: 100%; margin: 0; gap: 0; }
      .image-card, .info-card { border-radius: 0; border-left: 0; border-right: 0; box-shadow: none; }
      .image-card { min-height: 58vh; grid-template-rows: minmax(320px, 1fr) auto; }
      .main-image { max-height: 54vh; }
      .header { padding: 14px 16px; }
      .icon { width: 42px; height: 42px; border-radius: 14px; }
    }
  </style>
</head>
<body>
  <main class="viewer">
    <header class="header">
      <div class="header-content">
        <div class="title-wrap">
          <div class="icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="white" stroke-width="2"/><circle cx="9" cy="9" r="2" stroke="white" stroke-width="2"/><path d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L18 19" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h1 id="viewerTitle"></h1>
            <div class="subtitle" id="viewerSubtitle"></div>
          </div>
        </div>
        <button class="close" type="button" onclick="window.close()" title="Cerrar pestaña">×</button>
      </div>
    </header>
    <section class="stage">
      <article class="image-card">
        <div class="image-area">
          <button id="prevBtn" class="nav prev" type="button" aria-label="Anterior">‹</button>
          <img id="mainImage" class="main-image" alt="" />
          <div id="zoomLens" class="zoom-lens" aria-hidden="true"></div>
          <div id="emptyState" class="empty" hidden>Imagen no disponible</div>
          <button id="nextBtn" class="nav next" type="button" aria-label="Siguiente">›</button>
        </div>
        <div id="thumbs" class="thumbs"></div>
      </article>
      <aside class="info-card">
        <div class="info-main">
          <span id="counter" class="badge"></span>
          <div id="fileName" class="name"></div>
          <div class="description-title">Descripción</div>
          <div id="description" class="description"></div>
        </div>
        <div class="actions">
          <button id="downloadBtn" class="btn btn-primary" type="button">Descargar evidencia</button>
          <button class="btn btn-secondary" type="button" onclick="window.close()">Cerrar pestaña</button>
        </div>
      </aside>
    </section>
  </main>
  <script>
    const evidences = ${safeJson(evidences)};
    const title = ${safeJson(title)};
    let currentIndex = ${Number.isFinite(initialIndex) ? initialIndex : 0};
    const $ = (id) => document.getElementById(id);
    const getFileName = (url, fallback) => {
      if (fallback) return fallback;
      if (!url) return 'evidencia.jpg';
      try {
        const clean = url.split('?')[0];
        return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1)) || 'evidencia.jpg';
      } catch { return 'evidencia.jpg'; }
    };
    const resetZoom = () => {
      const lens = $('zoomLens');
      if (lens) lens.classList.remove('visible');
    };
    const render = () => {
      const total = evidences.length;
      if (!total) return;
      resetZoom();
      if (currentIndex < 0) currentIndex = total - 1;
      if (currentIndex >= total) currentIndex = 0;
      const item = evidences[currentIndex] || {};
      const image = $('mainImage');
      const empty = $('emptyState');
      const name = getFileName(item.url, item.name);
      $('viewerTitle').textContent = title;
      $('viewerSubtitle').textContent = total === 1 ? '1 evidencia' : total + ' evidencias';
      $('counter').textContent = (currentIndex + 1) + ' / ' + total;
      $('fileName').textContent = name;
      $('description').textContent = item.description || 'Sin descripción';
      if (item.url) {
        image.hidden = false;
        empty.hidden = true;
        image.src = item.url;
        image.alt = name;
      } else {
        image.hidden = true;
        empty.hidden = false;
      }
      $('prevBtn').style.display = total > 1 ? 'grid' : 'none';
      $('nextBtn').style.display = total > 1 ? 'grid' : 'none';
      const thumbs = $('thumbs');
      thumbs.innerHTML = '';
      thumbs.style.display = total > 1 ? 'flex' : 'none';
      evidences.forEach((ev, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'thumb' + (index === currentIndex ? ' active' : '');
        button.onclick = () => { currentIndex = index; render(); };
        const img = document.createElement('img');
        img.src = ev.url || '';
        img.alt = getFileName(ev.url, ev.name);
        button.appendChild(img);
        thumbs.appendChild(button);
      });
    };
    $('prevBtn').onclick = () => { currentIndex -= 1; render(); };
    $('nextBtn').onclick = () => { currentIndex += 1; render(); };
    $('mainImage').addEventListener('mousemove', (event) => {
      const image = $('mainImage');
      const lens = $('zoomLens');
      if (!image || !lens || image.hidden || !image.complete || !image.naturalWidth) return;
      const rect = image.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        resetZoom();
        return;
      }
      const zoom = 2.2;
      const lensSize = 190;
      lens.style.left = (image.offsetLeft + x) + 'px';
      lens.style.top = (image.offsetTop + y) + 'px';
      lens.style.backgroundImage = 'url("' + image.src + '")';
      lens.style.backgroundSize = (rect.width * zoom) + 'px ' + (rect.height * zoom) + 'px';
      lens.style.backgroundPosition = '-' + ((x * zoom) - (lensSize / 2)) + 'px -' + ((y * zoom) - (lensSize / 2)) + 'px';
      lens.classList.add('visible');
    });
    $('mainImage').addEventListener('mouseleave', resetZoom);
    $('downloadBtn').onclick = async () => {
      const item = evidences[currentIndex] || {};
      if (!item.url) return;
      const name = getFileName(item.url, item.name);
      try {
        if (item.url.startsWith('http')) {
          const response = await fetch(item.url);
          if (!response.ok) throw new Error('No se pudo descargar la evidencia.');
          const blob = await response.blob();
          const objectUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(objectUrl);
          return;
        }
        const link = document.createElement('a');
        link.href = item.url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        alert(error?.message || 'No se pudo descargar la evidencia.');
      }
    };
    render();
  </script>
</body>
</html>`;

const ViewEvidence = ({
  isOpen,
  onClose,
  evidences = [],
  title = 'Evidencias de la devolución'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { showError } = useAlert();

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [currentIndex]);

  if (!isOpen || !evidences || evidences.length === 0) return null;

  const evidenciasOrdenadas = [...evidences].reverse();
  const currentEvidence = evidenciasOrdenadas[currentIndex];
  const currentImageUrl = getEvidenceImageUrl(currentEvidence);
  const currentDescription = currentEvidence?.image_description || currentEvidence?.description || '';
  const shouldCollapseDescription = currentDescription.length > DESCRIPTION_PREVIEW_LIMIT;
  const visibleDescription = shouldCollapseDescription && !descriptionExpanded
    ? `${currentDescription.slice(0, DESCRIPTION_PREVIEW_LIMIT).trim()}...`
    : currentDescription;

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? evidenciasOrdenadas.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === evidenciasOrdenadas.length - 1 ? 0 : prev + 1);
  };

  const handleDownload = async (imageUrl, name) => {
    try {
      if (imageUrl?.startsWith('http')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name || 'evidencia.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (imageUrl?.startsWith('data:image') || imageUrl?.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = name || 'evidencia.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showError('No se puede descargar la imagen', 'La evidencia no tiene una ruta válida para descargar.');
      }
    } catch (error) {
      showError('Error al descargar la imagen', error?.message || 'Intenta nuevamente en unos segundos.');
    }
  };

  const handleOpenInNewTab = () => {
    const normalizedEvidences = evidenciasOrdenadas.map((evidence, index) => {
      const imageUrl = getEvidenceImageUrl(evidence);
      return {
        url: normalizeImageUrl(imageUrl),
        name: evidence?.name || getFileName(imageUrl) || `Evidencia ${index + 1}`,
        description: evidence?.image_description || evidence?.description || ''
      };
    });

    if (!normalizedEvidences.some((evidence) => evidence.url)) {
      showError('No se pueden abrir las evidencias', 'La devolución no tiene rutas válidas para mostrar.');
      return;
    }

    const newTab = window.open('', '_blank');
    if (!newTab) {
      showError('No se pudo abrir la pestaña', 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes para continuar.');
      return;
    }

    newTab.opener = null;
    newTab.document.open();
    newTab.document.write(buildEvidenceViewerHtml({
      title,
      evidences: normalizedEvidences,
      initialIndex: currentIndex
    }));
    newTab.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
      <div className="flex h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white shadow-[0_20px_60px_-10px_rgba(0,77,119,0.3)] sm:h-auto sm:max-h-[95vh] sm:rounded-2xl">
        <div className="relative flex flex-shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-6 py-3.5">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-sky-300/10" />
          <div className="relative flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <ImageIcon className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-white">{title}</h2>
              <p className="text-xs text-white/70">
                {evidences.length} {evidences.length === 1 ? 'evidencia' : 'evidencias'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="relative cursor-pointer rounded-full border border-white/10 p-1.5 text-white transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-50">
          <div className="flex h-full items-center justify-center p-3 sm:p-6">
            <div className="relative flex h-full w-full items-center justify-center">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`Evidencia ${currentIndex + 1}`}
                  className="h-auto max-h-[58vh] w-auto max-w-full rounded-2xl object-contain shadow-lg sm:max-h-[65vh]"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.alt = 'Error al cargar imagen';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="mb-2 h-12 w-12" />
                  <p className="text-sm">Imagen no disponible</p>
                </div>
              )}
              
              {evidenciasOrdenadas.length > 1 && (
                <>
                  <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#004D77]/20 bg-white/90 p-2 shadow-lg transition hover:scale-105 hover:bg-white hover:shadow-xl">
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#004D77]/20 bg-white/90 p-2 shadow-lg transition hover:scale-105 hover:bg-white hover:shadow-xl">
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>

          {evidenciasOrdenadas.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl border border-white/20 bg-black/50 p-2 backdrop-blur-sm">
              {evidenciasOrdenadas.map((ev, index) => {
                const thumbUrl = getEvidenceImageUrl(ev);
                return (
                  <button
                    key={`${thumbUrl || 'evidence'}-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-12 w-12 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-14 sm:w-14 ${
                      index === currentIndex ? 'scale-110 border-[#004D77] shadow-lg' : 'border-white/30 opacity-60 hover:scale-105 hover:opacity-100'
                    }`}
                  >
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={`Miniatura ${index + 1}`} className="h-full w-full object-cover" onError={(e) => { e.target.src = ''; }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-600">
                        <ImageIcon className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 flex-1">
            {currentDescription ? (
              <div className="max-w-full">
                <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600 [overflow-wrap:anywhere]">
                  {visibleDescription}
                </p>
                {shouldCollapseDescription && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded((current) => !current)}
                    className="mt-1 text-xs font-semibold text-[#004D77] transition hover:underline"
                  >
                    {descriptionExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs italic text-gray-400">Sin descripción</p>
            )}
          </div>
          
          <div className="flex flex-shrink-0 flex-col gap-2 sm:ml-4 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-xs font-medium text-gray-400">
              {currentIndex + 1} / {evidences.length}
            </span>
            <button
              type="button"
              onClick={handleOpenInNewTab}
              disabled={!currentImageUrl}
              className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                currentImageUrl
                  ? 'border-[#004D77] bg-white text-[#004D77] hover:bg-sky-100 hover:shadow-md'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              }`}
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
              Ver en otra pestaña
            </button>
            <button
              onClick={() => handleDownload(currentImageUrl, currentEvidence?.name || getFileName(currentImageUrl))}
              disabled={!currentImageUrl}
              className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                currentImageUrl 
                  ? 'cursor-pointer border-gray-400 text-gray-600 hover:bg-gray-200'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              }`}
            >
              <Download className="h-4 w-4" strokeWidth={1.8} />
              Descargar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#004D77] bg-white px-6 py-2 text-sm font-medium text-[#004D77] shadow-sm transition-colors hover:bg-sky-100 hover:shadow-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvidence;
