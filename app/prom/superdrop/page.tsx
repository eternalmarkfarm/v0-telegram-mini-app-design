"use client";

import { Eye } from 'lucide-react';

export default function SuperDrop() {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6 drop-shadow-[0_0_12px_rgba(91,75,255,0.4)]">
        SuperDrop
      </h1>

      <div className="yuze-glass rounded-[24px] p-8 text-center">
        <Eye className="w-16 h-16 mx-auto mb-4 text-[#5B4BFF] drop-shadow-[0_0_12px_rgba(91,75,255,0.5)]" />
        <p className="text-[#b3b3ff] text-base leading-relaxed">
          Здесь будут отображаться отслеживаемые вами стримеры
          <span className="block mt-2 text-sm font-semibold tracking-[0.3em] text-white/70">
            СКОРО
          </span>
        </p>
      </div>
    </div>
  );
}
