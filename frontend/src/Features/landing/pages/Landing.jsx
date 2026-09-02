import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import HeaderLanding from '../../layouts/HeaderLanding.jsx'
import Footer from '../../layouts/Footer.jsx'

function Landing() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f9fc]">
      <HeaderLanding />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Landing;
