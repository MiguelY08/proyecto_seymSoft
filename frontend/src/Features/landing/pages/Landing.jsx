import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderLanding from '../../layouts/HeaderLanding.jsx'
import Footer from '../../layouts/Footer.jsx'

function Landing() {
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
