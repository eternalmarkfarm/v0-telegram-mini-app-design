import type { ReactNode } from 'react';
import BottomNavigation from '@/app/prom/components/BottomNavigation';
import CosmicBackground from '@/app/prom/components/CosmicBackground';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0e1c] via-[#0b1026] to-[#111c44] relative overflow-hidden">
      {/* Космический фон с частицами */}
      <CosmicBackground />
      
      {/* Космический фон с радиальным свечением */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(91,75,255,0.18),rgba(11,14,28,0.2),rgba(11,14,28,0.6))]"></div>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[620px] h-[620px] bg-[#5B4BFF] opacity-[0.08] blur-[140px] rounded-full"></div>
        <div className="absolute bottom-[-220px] right-[-120px] w-[520px] h-[520px] bg-[#9146FF] opacity-[0.06] blur-[160px] rounded-full"></div>
      </div>
      
      {/* Контент страницы */}
      <div
        className="relative"
        style={{ paddingBottom: 'calc(140px + env(safe-area-inset-bottom))' }}
      >
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
