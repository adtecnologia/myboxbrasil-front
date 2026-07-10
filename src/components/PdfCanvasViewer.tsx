import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

import { ScrollArea } from "@/components/ui/scroll-area";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfCanvasViewerProps {
  data: Uint8Array | null;
}

const PdfCanvasViewer = ({ data }: PdfCanvasViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !data) return;

    let cancelled = false;
    let pdf: PDFDocumentProxy | null = null;
    container.replaceChildren();
    setLoading(true);
    setError(null);

    const renderPdf = async () => {
      try {
        pdf = await getDocument({ data: data.slice() }).promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.min(container.clientWidth - 32, 960);
          const scale = Math.max(targetWidth / baseViewport.width, 0.5);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) throw new Error("Não foi possível preparar a visualização do PDF.");

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className = "mx-auto mb-4 max-w-full rounded-md border border-border bg-background shadow-sm";
          container.appendChild(canvas);

          await page.render({ canvas, canvasContext: context, viewport }).promise;
          page.cleanup();
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Erro ao renderizar PDF.";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      container.replaceChildren();
      pdf?.cleanup();
    };
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Nenhum arquivo selecionado.
      </div>
    );
  }

  return (
    <div className="relative h-full bg-muted/20">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando PDF...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-sm text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" /> {error}
        </div>
      )}
      <ScrollArea className="h-full">
        <div ref={containerRef} className="min-h-full px-4 py-4" />
      </ScrollArea>
    </div>
  );
};

export default PdfCanvasViewer;