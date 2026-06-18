"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@gigabike/ui";
import { Placeholder } from "@/components/Placeholder";
import { useScrollLock } from "@/lib/useScrollLock";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DEFAULT_ZOOM = { scale: MIN_ZOOM, x: 0, y: 0 };

type ZoomState = typeof DEFAULT_ZOOM;
type ZoomGesture =
  | {
      mode: "pinch";
      distance: number;
      midpoint: { x: number; y: number };
      start: ZoomState;
    }
  | {
      mode: "pan";
      point: { x: number; y: number };
      start: ZoomState;
    }
  | null;

type TouchPoint = {
  clientX: number;
  clientY: number;
};

function getDistance(a: TouchPoint, b: TouchPoint) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function getMidpoint(a: TouchPoint, b: TouchPoint) {
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  };
}

function clampZoom(scale: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
}

export function ProductGallery({
  gallery,
  images = [],
  condition,
  conditionLabel,
  featured,
  featuredLabel,
}: {
  gallery: number;
  images?: string[];
  condition: "New" | "Used";
  conditionLabel: string;
  featured: boolean;
  featuredLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const zoomRef = useRef(DEFAULT_ZOOM);
  const zoomGesture = useRef<ZoomGesture>(null);
  const hasImages = images.length > 0;
  const count = hasImages ? images.length : gallery;
  const current = count > 0 ? Math.min(active, count - 1) : 0;
  const canMove = count > 1;

  useScrollLock(lightboxOpen);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const goTo = (index: number) => {
    if (!count) return;
    setZoom(DEFAULT_ZOOM);
    setActive((index + count) % count);
  };

  const goPrev = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  const openLightbox = () => {
    setZoom(DEFAULT_ZOOM);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(DEFAULT_ZOOM);
  };

  const preventTouchScroll = (event: TouchEvent) => {
    if (event.cancelable) event.preventDefault();
  };

  const handleZoomTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      preventTouchScroll(event);
      const first = event.touches[0];
      const second = event.touches[1];
      if (!first || !second) return;
      zoomGesture.current = {
        mode: "pinch",
        distance: getDistance(first, second),
        midpoint: getMidpoint(first, second),
        start: zoomRef.current,
      };
      return;
    }

    if (event.touches.length === 1 && zoomRef.current.scale > MIN_ZOOM) {
      preventTouchScroll(event);
      const touch = event.touches[0];
      if (!touch) return;
      zoomGesture.current = {
        mode: "pan",
        point: { x: touch.clientX, y: touch.clientY },
        start: zoomRef.current,
      };
    }
  };

  const handleZoomTouchMove = (event: TouchEvent) => {
    const gesture = zoomGesture.current;
    if (!gesture) return;

    if (gesture.mode === "pinch" && event.touches.length === 2) {
      preventTouchScroll(event);
      const first = event.touches[0];
      const second = event.touches[1];
      if (!first || !second) return;
      const midpoint = getMidpoint(first, second);
      const nextScale = clampZoom((getDistance(first, second) / gesture.distance) * gesture.start.scale);
      setZoom({
        scale: nextScale,
        x: gesture.start.x + midpoint.x - gesture.midpoint.x,
        y: gesture.start.y + midpoint.y - gesture.midpoint.y,
      });
      return;
    }

    if (gesture.mode === "pan" && event.touches.length === 1) {
      preventTouchScroll(event);
      const touch = event.touches[0];
      if (!touch) return;
      setZoom({
        scale: gesture.start.scale,
        x: gesture.start.x + touch.clientX - gesture.point.x,
        y: gesture.start.y + touch.clientY - gesture.point.y,
      });
    }
  };

  const handleZoomTouchEnd = () => {
    zoomGesture.current = null;
    if (zoomRef.current.scale <= MIN_ZOOM + 0.02) setZoom(DEFAULT_ZOOM);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, lightboxOpen]);

  return (
    <div className="gallery">
      <div
        role="button"
        tabIndex={0}
        className="gallery-main"
        onClick={openLightbox}
        onKeyDown={(event) => {
          if (event.currentTarget !== event.target) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLightbox();
          }
        }}
        aria-label="Open photo fullscreen"
      >
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={images[current]}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Placeholder
            key={current}
            label={`bike photo ${current + 1} of ${count}`}
            style={{ position: "absolute", inset: 0 }}
          />
        )}
        <span className={`chip ${condition === "New" ? "chip-new" : "chip-used"} gcond`}>
          {conditionLabel}
        </span>
        {featured && (
          <span className="gstar">
            <Icon name="star" />
            {featuredLabel}
          </span>
        )}
        {canMove && (
          <>
            <span className="gallery-count">
              {current + 1}/{count}
            </span>
            <button
              type="button"
              className="gallery-nav gallery-prev"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label="Previous photo"
            >
              <Icon name="chevron" />
            </button>
            <button
              type="button"
              className="gallery-nav gallery-next"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label="Next photo"
            >
              <Icon name="chevron" />
            </button>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="thumbs">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              className={`thumb ${current === i ? "on" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
            >
              {hasImages ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[i]}
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Placeholder label={`${i + 1}`} style={{ position: "absolute", inset: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
      {mounted &&
        lightboxOpen &&
        createPortal(
          <div
            className="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Product photo"
            onClick={closeLightbox}
          >
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={closeLightbox}
              aria-label="Close fullscreen photo"
            >
              <Icon name="close" />
            </button>
            <div
              className={`gallery-lightbox-stage ${zoom.scale > MIN_ZOOM ? "is-zoomed" : ""}`}
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleZoomTouchStart}
              onTouchMove={handleZoomTouchMove}
              onTouchEnd={handleZoomTouchEnd}
              onTouchCancel={handleZoomTouchEnd}
            >
              {hasImages ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[current]}
                  alt=""
                  style={{
                    transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
                  }}
                />
              ) : (
                <Placeholder label={`bike photo ${current + 1} of ${count}`} />
              )}
            </div>
            {canMove && (
              <>
                <button
                  type="button"
                  className="gallery-lightbox-nav gallery-lightbox-prev"
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous photo"
                >
                  <Icon name="chevron" />
                </button>
                <button
                  type="button"
                  className="gallery-lightbox-nav gallery-lightbox-next"
                  onClick={(event) => {
                    event.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next photo"
                >
                  <Icon name="chevron" />
                </button>
                <div className="gallery-lightbox-count">
                  {current + 1}/{count}
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
