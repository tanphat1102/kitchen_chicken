import React, { useEffect, useRef } from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import TodayMenuCard from '@/modules/Homepage/TodayMenuCard';
import type { MenuItem } from '@/services/menuItemsService';

interface Props {
  items: MenuItem[];
  autoplayDelay?: number; // ms
}

const TodayEmblaCarousel: React.FC<Props> = ({ items, autoplayDelay = 3000 }) => {
  const autoplay = useRef(
    Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: false,
      skipSnaps: false,
    },
    [autoplay.current]
  ) as UseEmblaCarouselType;

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();

    autoplay.current.play();
    emblaApi.on('pointerDown', autoplay.current.stop);
    emblaApi.on('pointerUp', autoplay.current.reset);
    emblaApi.on('reInit', autoplay.current.reset);
  }, [emblaApi, items.length]);

  if (!items || items.length === 0) return null;

  const slides = items.length < 4 ? [...items, ...items] : items;

  return (
    <div className="relative" onMouseEnter={autoplay.current.stop} onMouseLeave={autoplay.current.reset}>
      <div className="overflow-x-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {slides.map((item) => (
            <div key={item.id} className="flex-[0_0_auto]">
              <TodayMenuCard
                imageUrl={item.imageUrl}
                title={item.name}
                categoryName={item.categoryName}
                price={item.price}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayEmblaCarousel;
