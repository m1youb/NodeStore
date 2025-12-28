import React from 'react'
import { useState, useEffect } from 'react';
import { useAdminStore } from '../store/AdminStore';
import FeaturedProduct from './FeaturedProduct';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeaturedProducts() {
  const { getFeaturedProducts, featuredProducts } = useAdminStore();
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getFeaturedProducts();
  }, [getFeaturedProducts])

  useEffect(() => {
    const handleResize = function () {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(3)
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  })

  const nextButton = () => {
    setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
  }
  const prevButton = () => {
    setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
  }

  const isStartOfSlider = currentIndex === 0;
  const isEndOfSlider = currentIndex >= featuredProducts.length - itemsPerPage;
  const visibleProducts = featuredProducts.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className='w-full'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold tracking-tight mb-2 uppercase'>Featured Systems</h2>
        <p className='spec-summary'>HAND-PICKED HIGH-PERFORMANCE CONFIGURATIONS</p>
      </div>

      <div className='relative'>
        {/* Navigation Buttons */}
        <button
          className='absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-[#222222] hover:border-[#00D9FF] transition-fast group disabled:opacity-30 disabled:cursor-not-allowed bg-[#0A0A0A]'
          onClick={prevButton}
          disabled={isStartOfSlider}
        >
          <ChevronLeft className="w-5 h-5 text-[#B0B0B0] group-hover:text-[#00D9FF] transition-fast" />
        </button>

        {/* Products Grid */}
        <div className='overflow-hidden'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-none'>
            {
              visibleProducts.map(product => {
                return <FeaturedProduct key={product._id} product={product} />
              })
            }
          </div>
        </div>

        <button
          onClick={nextButton}
          disabled={isEndOfSlider}
          className='absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-[#222222] hover:border-[#00D9FF] transition-fast group disabled:opacity-30 disabled:cursor-not-allowed bg-[#0A0A0A]'
        >
          <ChevronRight className="w-5 h-5 text-[#B0B0B0] group-hover:text-[#00D9FF] transition-fast" />
        </button>
      </div>
    </div>
  )
}
