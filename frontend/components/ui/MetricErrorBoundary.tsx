'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class MetricErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center h-full w-full bg-[#070F2B] text-[#9290C3] p-4 text-center border border-[#535C91]/30 rounded-xl">
                    <h2 className="text-xl font-bold mb-2">Simulaton Error</h2>
                    <p className="text-sm opacity-80 mb-4">
                        We couldn't load the 3D visualization on this device.
                    </p>
                    <p className="text-xs font-mono bg-black/30 p-2 rounded max-w-xs overflow-auto">
                        {this.state.error?.message}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 px-4 py-2 bg-[#535C91] hover:bg-[#1B1A55] text-white rounded transition-colors text-sm"
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
