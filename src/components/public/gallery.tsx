"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { useReducedMotionPreference } from "@/components/motion/motion-preference";

export type GallerySlide = {
  src: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

// Case-study slideshow (FR-2.4): swipe on phones, arrow keys and buttons on
// desktop, a caption and required alt text per image. Under reduced motion
// slides change without the scroll animation.
export function Gallery({ title, slides }: { title: string; slides: readonly GallerySlide[] }) {
  const reduced = useReducedMotionPreference();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const previous = useCallback(() => emblaApi?.scrollPrev(reduced), [emblaApi, reduced]);
  const next = useCallback(() => emblaApi?.scrollNext(reduced), [emblaApi, reduced]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  }

  const current = slides[index] ?? slides[0];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${title} screenshots`}
      className="mt-8 flex flex-col gap-3"
      onKeyDown={onKeyDown}
    >
      <div ref={emblaRef} className="overflow-hidden rounded-[16px]" tabIndex={0}
        aria-label="Screenshots; use the left and right arrow keys to move between them">
        <div className="flex touch-pan-y">
          {slides.map((slide, slideIndex) => (
            <figure
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${slides.length}`}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                sizes="(min-width: 1024px) 720px, 100vw"
                className="h-60 w-full rounded-[16px] bg-surface object-contain lg:h-[420px]"
              />
            </figure>
          ))}
        </div>
      </div>
      {current?.caption ? (
        <p className="text-[15px] leading-[1.45]" aria-live="polite">
          {current.caption}
        </p>
      ) : null}
      {slides.length > 1 ? (
        <div className="flex items-center justify-between">
          <button type="button" onClick={previous} aria-label="Previous screenshot"
            className="mi-btn flex size-11 items-center justify-center rounded-[12px] border border-line">
            <Chevron direction="left" />
          </button>
          <span className="text-[15px] text-muted" aria-live="polite">
            {index + 1} of {slides.length}
          </span>
          <button type="button" onClick={next} aria-label="Next screenshot"
            className="mi-btn flex size-11 items-center justify-center rounded-[12px] border border-line">
            <Chevron direction="right" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
