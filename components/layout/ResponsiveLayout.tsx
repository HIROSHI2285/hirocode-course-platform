'use client'

import { useState, useEffect } from 'react'
import Header from './Header'
import MobileNav from './MobileNav'
import Footer from './Footer'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function ResponsiveLayout({
  children,
  showSidebar = false
}: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        isMobile={isMobile}
      />

      <div className="flex">
        {/* モバイルメニューオーバーレイ */}
        {isMobileMenuOpen && isMobile && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <MobileNav
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* フッター */}
      <Footer />
    </div>
  )
}