import { Viewer, Worker } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { useEffect, useRef } from 'react';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

interface PdfViewerComponentProps {
  fileUrl: string;
}

function PdfViewerComponent({ fileUrl }: PdfViewerComponentProps) {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();

  const { GoToNextPage, GoToPreviousPage, CurrentPageLabel } =
    pageNavigationPluginInstance;
  const { ZoomInButton, ZoomOutButton, CurrentScale } = zoomPluginInstance;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const interval = setInterval(() => {
      const viewer = container.querySelector(
        '.rpv-core__viewer'
      ) as HTMLDivElement;
      if (viewer) {
        viewerContainerRef.current = viewer;
        clearInterval(interval);

        // Mouse events
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let scrollTop = 0;

        const onMouseDown = (e: MouseEvent) => {
          isDragging = true;
          startX = e.pageX;
          startY = e.pageY;
          scrollLeft = viewer.scrollLeft;
          scrollTop = viewer.scrollTop;
          viewer.style.cursor = 'grabbing';
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isDragging) {
            return;
          }
          const x = e.pageX;
          const y = e.pageY;
          viewer.scrollLeft = scrollLeft - (x - startX);
          viewer.scrollTop = scrollTop - (y - startY);
        };

        const onMouseUp = () => {
          isDragging = false;
          viewer.style.cursor = 'grab';
        };

        // Touch events
        let touchStartX = 0;
        let touchStartY = 0;
        let touchScrollLeft = 0;
        let touchScrollTop = 0;

        const onTouchStart = (e: TouchEvent) => {
          const touch = e.touches[0];
          touchStartX = touch.pageX;
          touchStartY = touch.pageY;
          touchScrollLeft = viewer.scrollLeft;
          touchScrollTop = viewer.scrollTop;
        };

        const onTouchMove = (e: TouchEvent) => {
          const touch = e.touches[0];
          const deltaX = touch.pageX - touchStartX;
          const deltaY = touch.pageY - touchStartY;
          viewer.scrollLeft = touchScrollLeft - deltaX;
          viewer.scrollTop = touchScrollTop - deltaY;
        };

        viewer.style.cursor = 'grab';
        viewer.addEventListener('mousedown', onMouseDown);
        viewer.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        viewer.addEventListener('touchstart', onTouchStart, { passive: true });
        viewer.addEventListener('touchmove', onTouchMove, { passive: true });

        return () => {
          viewer.removeEventListener('mousedown', onMouseDown);
          viewer.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          viewer.removeEventListener('touchstart', onTouchStart);
          viewer.removeEventListener('touchmove', onTouchMove);
        };
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        border: '1px solid var(--color01)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            padding: '4px 8px',
            borderBottom: '1px solid var(--color01)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GoToPreviousPage />
            <CurrentPageLabel />
            <GoToNextPage />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ZoomOutButton />
            <CurrentScale />
            <ZoomInButton />
          </div>
        </div>

        <div
          ref={containerRef}
          style={{
            height: '70vh',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Viewer
            fileUrl={fileUrl}
            plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
          />
        </div>
      </Worker>
    </div>
  );
}

export default PdfViewerComponent;
