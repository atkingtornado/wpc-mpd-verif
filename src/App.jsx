import { useState } from 'react'

import { NavBar } from "@atkingtornado/wpc-navbar-reactjs";

import MapDisplay from "./features/MapDisplay"

import './App.css'

function App() {

  return (
    <>
      <div className="App">
        <div className="z-10 relative">
          <NavBar/>

          <MapDisplay/>
        </div>
      </div>
    </>
  )
}

export default App
