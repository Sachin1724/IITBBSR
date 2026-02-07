'use client'

import { Eye, EyeOff } from 'lucide-react'

interface ViewPasswordToggleProps {
    show: boolean
    onToggle: () => void
}

export function ViewPasswordToggle({ show, onToggle }: ViewPasswordToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-lavender/50 hover:text-white transition-colors"
        >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
    )
}
