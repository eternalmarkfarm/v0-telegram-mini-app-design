"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface LinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean
    isLinked?: boolean
    loadingText?: string
}

function TwitchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
    )
}

export function LinkButton({ className, isLoading, isLinked, loadingText, ...props }: LinkButtonProps) {
    const { t } = useI18n()
    
    if (isLinked) {
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 animate-in fade-in zoom-in duration-300">
                <Check className="h-4 w-4 text-success" />
            </div>
        )
    }

    return (
        <Button
            size="sm"
            className={cn(
                "relative overflow-hidden transition-all duration-300",
                isLoading
                    ? "bg-[#9146ff]/80 text-white/90 border-[#9146ff]/50 w-[140px]"
                    : "bg-[#9146ff] hover:bg-[#7c3aed] text-white w-[100px]", // width transition for text change
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {/* Background Shimmer Effect */}
            {isLoading && (
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}

            {/* Pulse Border Effect */}
            {isLoading && (
                <div className="absolute inset-0 rounded-md border-2 border-white/20 animate-pulse" />
            )}

            <div className="flex items-center gap-2 relative z-10">
                <TwitchIcon className={cn("h-4 w-4", isLoading && "animate-bounce")} />

                {isLoading ? (
                    <span className="text-xs font-medium flex items-center">
                        {t.syncing}
                        <span className="flex w-3 text-left ml-0.5">
                            <span className="animate-[bounce_1.4s_infinite_0ms]">.</span>
                            <span className="animate-[bounce_1.4s_infinite_200ms]">.</span>
                            <span className="animate-[bounce_1.4s_infinite_400ms]">.</span>
                        </span>
                    </span>
                ) : (
                    <span>{t.link}</span>
                )}
            </div>
        </Button>
    )
}
