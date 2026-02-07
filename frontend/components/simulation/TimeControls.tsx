'use client'

interface TimeControlsProps {
    isPlaying: boolean
    currentTime: number
    maxTime: number
    timeScale: number
    onPlayPause: () => void
    onReset: () => void
    onTimeChange: (time: number) => void
    onTimeScaleChange: (scale: number) => void
}

export function TimeControls({
    isPlaying,
    currentTime,
    maxTime,
    timeScale,
    onPlayPause,
    onReset,
    onTimeChange,
    onTimeScaleChange,
}: TimeControlsProps) {
    return (
        <div className="bg-[#1B1A55]/80 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-4">
            <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                    onClick={onPlayPause}
                    className="bg-[#535C91] hover:bg-[#9290C3] text-white p-3 rounded-lg transition-colors"
                >
                    {isPlaying ? (
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
                        </svg>
                    ) : (
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M6 4l10 6-10 6V4z" />
                        </svg>
                    )}
                </button>

                {/* Reset Button */}
                <button
                    onClick={onReset}
                    className="bg-[#535C91] hover:bg-[#9290C3] text-white p-3 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                    </svg>
                </button>

                {/* Time Slider */}
                <div className="flex-1">
                    <input
                        type="range"
                        min="0"
                        max={maxTime}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => onTimeChange(Number(e.target.value))}
                        className="w-full h-2 bg-[#535C91]/30 rounded-lg appearance-none cursor-pointer accent-[#9290C3]"
                    />
                    <div className="flex justify-between text-xs text-[#9290C3]/60 mt-1">
                        <span>{currentTime.toFixed(1)}s</span>
                        <span>{maxTime.toFixed(1)}s</span>
                    </div>
                </div>

                {/* Time Scale */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#9290C3]">Speed:</span>
                    <select
                        value={timeScale}
                        onChange={(e) => onTimeScaleChange(Number(e.target.value))}
                        className="bg-[#070F2B] border border-[#535C91]/30 rounded-lg px-3 py-2 text-[#9290C3] text-sm focus:outline-none focus:border-[#9290C3]"
                    >
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="2">2x</option>
                        <option value="5">5x</option>
                        <option value="10">10x</option>
                        <option value="50">50x</option>
                        <option value="100">100x</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
