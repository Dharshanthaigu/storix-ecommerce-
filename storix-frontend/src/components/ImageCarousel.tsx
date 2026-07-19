import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function ImageCarousel({ images = [] }: { images: string[] }) {
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  if (!images.length) {
    return (
      <div className="relative w-full h-80 rounded-lg bg-mist flex items-center justify-center text-slate text-sm">
        No image available
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden">
      <Swiper spaceBetween={10} slidesPerView={1} className="w-full h-full">
        {images.map((src, i) => (
          <SwiperSlide key={i} className="w-full h-full">
            {failed[i] ? (
              <div className="w-full h-full flex items-center justify-center bg-mist text-slate text-sm">
                Image not available
              </div>
            ) : (
              <img
                src={src}
                alt={`slide-${i}`}
                loading="eager"
                className="w-full h-full object-cover"
                onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}