import React, { useEffect, useRef } from 'react';
import { FaChevronDown, FaCheckCircle } from 'react-icons/fa';

const Pagination = ({ 
  displayLimit = 15, 
  totalItems = 0, 
  onLoadMore, 
  batchSize = 15 
}) => {
  const observerRef = useRef(null);

  const shownCount = Math.min(displayLimit, totalItems);
  const hasMore = displayLimit < totalItems;

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, onLoadMore, displayLimit]);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mt-6">
      {/* Information text */}
      <div className="text-xs font-bold text-slate-500 italic text-center">
        {hasMore ? (
          <span>
            Menampilkan <strong className="text-slate-900">{shownCount}</strong> dari <strong className="text-blue-600">{totalItems}</strong> data
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-emerald-600 font-black">
            <FaCheckCircle size={13} /> Menampilkan semua {totalItems} data
          </span>
        )}
      </div>

      {/* Sentinel / Load More button */}
      {hasMore && (
        <div ref={observerRef} className="w-full flex justify-center pt-1">
          <button
            onClick={onLoadMore}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md flex items-center gap-2 italic active:scale-95 group"
          >
            Muat Lebih Banyak ({totalItems - shownCount} tersisa)
            <FaChevronDown size={10} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
