import React from 'react';

interface TodayMenuCardProps {
  imageUrl: string;
  title: string;
  categoryName?: string;
  price?: number;
}

function formatVND(value?: number) {
  if (value == null || Number.isNaN(value)) return '';
  const parts = Math.floor(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${parts} VND`;
}

export const TodayMenuCard: React.FC<TodayMenuCardProps> = ({ imageUrl, title, categoryName, price }) => {
  return (
    <div className="group relative w-56 sm:w-60 flex-shrink-0 select-none">
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-md">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category tag on image */}
        {categoryName && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur">
            {categoryName}
          </span>
        )}

        {/* Hover info tab */}
        <div className="absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="mx-2 mb-2 rounded-xl bg-white/95 shadow-lg p-3">
            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{title}</p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-500 line-clamp-1">{categoryName}</span>
              <span className="font-bold text-red-700">{formatVND(price)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayMenuCard;
