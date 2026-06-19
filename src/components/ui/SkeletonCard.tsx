import React from 'react'

interface SkeletonCardProps {
  viewMode?: 'grid' | 'list'
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div 
        className="glass-card flex items-center gap-4 p-3 pointer-events-none select-none"
        style={{ borderRadius: 12 }}
      >
        {/* Artwork skeleton */}
        <div className="w-14 h-14 rounded-xl skeleton shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* ID skeleton */}
            <div className="w-8 h-3 rounded skeleton" />
            {/* Name skeleton */}
            <div className="w-24 h-4 rounded skeleton" />
          </div>
          <div className="flex gap-1 mt-2">
            {/* Type badge skeleton */}
            <div className="w-12 h-5 rounded-full skeleton" />
            <div className="w-12 h-5 rounded-full skeleton" />
          </div>
        </div>
        
        {/* Heart icon skeleton */}
        <div className="w-8 h-8 rounded-full skeleton shrink-0" />
      </div>
    )
  }

  return (
    <div
      className="glass-card overflow-hidden rounded-2xl p-4 h-[240px] pointer-events-none select-none flex flex-col justify-between"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        {/* ID skeleton */}
        <div className="w-10 h-3 rounded skeleton" />
        {/* Heart skeleton */}
        <div className="w-5 h-5 rounded-full skeleton" />
      </div>

      {/* Artwork circle & glow placeholder */}
      <div className="flex justify-center items-center py-2 relative flex-1">
        <div className="w-24 h-24 rounded-full skeleton" />
      </div>

      {/* Name & Types */}
      <div className="mt-2 flex flex-col items-center gap-2">
        {/* Name skeleton */}
        <div className="w-24 h-4 rounded skeleton" />
        
        {/* Types badges skeleton */}
        <div className="flex justify-center gap-1">
          <div className="w-14 h-5 rounded-full skeleton" />
          <div className="w-14 h-5 rounded-full skeleton" />
        </div>
      </div>

      {/* Optional Stats strip layout spacer if required, but height/weight is conditional. Let's keep it clean */}
    </div>
  )
}

export default SkeletonCard
