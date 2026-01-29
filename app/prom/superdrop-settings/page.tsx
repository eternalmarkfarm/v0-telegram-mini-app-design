"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

export default function SuperDropSettings() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#b3b3ff] hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(91,75,255,0.4)]">
          Настройки SuperDrop
        </h1>
      </div>

      <div className="yuze-glass rounded-[24px] p-8 text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#5B4BFF] opacity-30 blur-2xl rounded-full"></div>
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-[#5B4BFF]/30 to-[#9146FF]/30 rounded-[20px] flex items-center justify-center border border-white/20">
            <SettingsIcon className="w-10 h-10 text-[#5B4BFF] drop-shadow-[0_0_12px_rgba(91,75,255,0.6)]" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Скоро здесь появятся настройки!</h2>
        <p className="text-[#b3b3ff] leading-relaxed max-w-sm mx-auto">
          Здесь скоро появятся расширенные настройки SuperDrop: правила дропов, приоритеты, уведомления, лимиты и
          многое другое. Следите за обновлениями!
        </p>

        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-[#5B4BFF] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#9146FF] rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-[#5B4BFF] rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
