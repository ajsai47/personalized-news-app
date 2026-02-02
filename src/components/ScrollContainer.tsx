"use client"

import { ReactNode } from "react"

interface ScrollContainerProps {
  children: ReactNode
}

export function ScrollContainer({ children }: ScrollContainerProps) {
  return (
    <div className="scroll-container relative max-w-4xl mx-auto">
      {/* Top Roll */}
      <div className="scroll-roll-top" />

      {/* Ornate Border Frame */}
      <div className="scroll-frame">
        {/* Left Border Flourish */}
        <div className="scroll-border-left" />

        {/* Main Content Area */}
        <div className="scroll-content px-8 py-12">
          {children}
        </div>

        {/* Right Border Flourish */}
        <div className="scroll-border-right" />
      </div>

      {/* Bottom Roll */}
      <div className="scroll-roll-bottom" />
    </div>
  )
}
