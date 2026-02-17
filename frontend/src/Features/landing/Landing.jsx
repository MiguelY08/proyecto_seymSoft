import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderLanding from '../layouts/HeaderLanding.jsx'
import Footer from '../layouts/Footer.jsx'

function Landing() {
  return (
    <>
      <HeaderLanding />
      <Outlet />
      <Footer />
    </>
  )
}

export default Landing;