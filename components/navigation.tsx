"use client"

import { Home, Gift, Users, User, Dices } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
    const pathname = usePathname()

    const tabs = [
        { label: "Main", icon: Home, href: "/" },
        { label: "SuperDrop", icon: Gift, href: "/superdrop" },
        { label: "Dice", icon: Dices, href: "/roll", isCenter: true },
        { label: "Streamers", icon: Users, href: "/streamers" },
        { label: "Profile", icon: User, href: "/profile" },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
            <div className="relative w-full max-w-md h-[84px] pointer-events-auto">
                {/* Shadow layer */}
                <div className="absolute inset-0 bg-black/40 blur-2xl rounded-full -z-10 translate-y-2 scale-95" />

                {/* Custom SVG Background for the Wave Shape */}
                <svg
                    viewBox="0 0 400 84"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 32C0 14.3269 14.3269 0 32 0H144.5C154.5 0 162.5 4.5 168.5 12C176.5 22 186.5 28 200 28C213.5 28 223.5 22 231.5 12C237.5 4.5 245.5 0 255.5 0H368C385.673 0 400 14.3269 400 32V52C400 69.6731 385.673 84 368 84H32C14.3269 84 0 69.6731 0 52V32Z"
                        fill="#121019"
                        fillOpacity="0.85"
                    />
                    <path
                        d="M32 0.5H144.5C154.2 0.5 162 4.8 167.8 12.1L168.1 12.5C176.3 22.8 186.6 28.5 200 28.5C213.4 28.5 223.7 22.8 231.9 12.5L232.2 12.1C238 4.8 245.8 0.5 255.5 0.5H368C385.4 0.5 399.5 14.6 399.5 32V52C399.5 69.4 385.4 83.5 368 83.5H32C14.6 83.5 0.5 69.4 0.5 52V32C0.5 14.6 14.6 0.5 32 0.5Z"
                        stroke="white"
                        strokeOpacity="0.1"
                    />
                </svg>

                {/* Backdrop blur effect */}
                <div className="absolute inset-x-8 top-0 h-7 backdrop-blur-xl -z-10" />

                {/* Navigation Content */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                    {tabs.map((tab, idx) => {
                        if (tab.isCenter) {
                            return (
                                <div key={tab.label} className="relative w-20 flex flex-col items-center">
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                                        <Link
                                            href={tab.href}
                                            className="group relative flex items-center justify-center w-20 h-20"
                                        >
                                            {/* Outer Glow */}
                                            <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-40 group-active:opacity-60 transition-opacity" />

                                            {/* Button Body */}
                                            <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-red-500 via-red-700 to-black p-[2px] shadow-2xl transform transition-transform group-active:scale-90">
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center border border-white/10">
                                                    <Dices className="w-10 h-10 text-white drop-shadow-lg" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <span className="mt-10 text-[10px] font-bold text-white/60 tracking-widest uppercase">
                                        {/* Optional text or empty space */}
                                    </span>
                                </div>
                            )
                        }

                        const isActive = pathname === tab.href

                        return (
                            <Link
                                key={tab.label}
                                href={tab.href}
                                className="flex flex-col items-center justify-center flex-1 h-full px-1 pt-2 transition-all active:scale-95"
                            >
                                <div className={`relative p-2 rounded-xl transition-colors ${isActive ? "" : ""}`}>
                                    <tab.icon className={`w-6 h-6 ${isActive ? "text-white" : "text-white/30"}`} />
                                    {isActive && (
                                        <div className="absolute inset-0 bg-white/5 blur-md rounded-full -z-10" />
                                    )}
                                </div>
                                <span className={`text-[9px] mt-0.5 font-bold uppercase tracking-wider transition-colors ${isActive ? "text-white" : "text-white/30"}`}>
                                    {tab.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
