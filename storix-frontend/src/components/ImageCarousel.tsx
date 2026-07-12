import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function ImageCarousel({ images = [] }: { images: string[] }) {
  if (!images.length) return <div className="bg-gray-100 h-80 rounded" />;
  return (
    <Swiper spaceBetween={10} slidesPerView={1} className="rounded-lg overflow-hidden">
      {images.map((src, i) => (
        <SwiperSlide key={i}>
          <img src={src} alt={`slide-${i}`} className="w-full h-80 object-cover" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}