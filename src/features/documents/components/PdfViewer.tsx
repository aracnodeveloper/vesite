import { useEffect, useRef, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { DocumentTheme } from "../types/Document";

interface PdfViewerProps {
  url: string;
  title: string;
  themeConfig: DocumentTheme;
  /** Alto máximo del visor; las páginas se desplazan dentro. */
  maxHeight?: number;
}

/**
 * pdf.js se carga solo cuando hay un documento abierto (es pesado). Se usa la
 * build "legacy" para que funcione en navegadores móviles más antiguos; un
 * <iframe> no sirve en móvil (Android lo descarga, iOS solo muestra 1 página).
 */
const loadPdfJs = async () => {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
};

interface PdfPageProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  /** Contenedor con scroll del visor: una página se pinta al acercarse a su zona visible. */
  scrollRoot: HTMLElement | null;
}

/** Pinta una página cuando entra en la zona visible del visor, ajustada a su ancho. */
const PdfPage = ({ pdf, pageNumber, width, scrollRoot }: PdfPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1.414); // A4 hasta conocer la página

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { root: scrollRoot, rootMargin: "200px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!visible || !width) return;
    let cancelled = false;
    let renderTask: { cancel: () => void } | null = null;

    pdf.getPage(pageNumber).then((page) => {
      if (cancelled || !canvasRef.current) return;
      const base = page.getViewport({ scale: 1 });
      setAspectRatio(base.height / base.width);

      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: (width / base.width) * pixelRatio });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const task = page.render({ canvasContext: canvas.getContext("2d")!, viewport });
      renderTask = task;
      task.promise.catch(() => undefined);
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [visible, pdf, pageNumber, width]);

  return (
    <div ref={wrapperRef} className="bg-white shadow-sm" style={{ width, height: width * aspectRatio }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

/** Documento abierto: el contenido del PDF dentro del vesite. */
const PdfViewer = ({ url, title, themeConfig, maxHeight = 520 }: PdfViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    setPdf(null);
    setError(false);

    loadPdfJs()
      .then((pdfjs) => pdfjs.getDocument({ url }).promise)
      .then((doc) => {
        loaded = doc;
        if (!cancelled) setPdf(doc);
      })
      .catch((err) => {
        console.error("No se pudo cargar el PDF:", err);
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      loaded?.destroy();
    };
  }, [url]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const textColor = themeConfig.colors.accentText || themeConfig.colors.text;

  return (
    <div className="w-full mt-2 rounded-lg shadow-lg overflow-hidden" style={{ background: themeConfig.colors.accent }}>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} color={textColor} className="flex-shrink-0" />
          <span
            className="text-sm font-semibold truncate"
            style={{ color: textColor, fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary }}
          >
            {title}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-1.5 rounded-md hover:bg-black/10 transition-colors"
          title="Abrir en una pestaña nueva"
        >
          <Download size={16} color={textColor} />
        </a>
      </div>

      <div ref={containerRef} className="overflow-y-auto bg-gray-100 px-2 py-2" style={{ maxHeight }}>
        {error ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-gray-600 py-10 underline"
          >
            No se pudo mostrar el documento. Toca aquí para abrirlo.
          </a>
        ) : !pdf || !width ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {Array.from({ length: pdf.numPages }, (_, index) => (
              <PdfPage
                key={index}
                pdf={pdf}
                pageNumber={index + 1}
                width={width}
                scrollRoot={containerRef.current}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
