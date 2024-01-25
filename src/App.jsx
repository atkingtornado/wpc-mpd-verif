import { useState } from 'react'

import { NavBar } from "@atkingtornado/wpc-navbar-reactjs";

import MapDisplay from "./features/MapDisplay"
import SelectionMenu from "./features/SelectionMenu"

import './App.css'

function App() {

  const dataURL = 'http://localhost:3001/' 

  const [geojsonData, setGeojsonData] = useState({})

  const handleMapDataChange = (newData) => {
    console.log(newData)
    setGeojsonData(newData)
  }

  return (
    <>
      <div className="App">
        <div className="relative">
          <div className="z-50 relative">
            <NavBar/>
          </div>
          <SelectionMenu 
            geojsonData={geojsonData} 
            handleMapDataChange={handleMapDataChange} 
            dataURL={dataURL}
          />
          <MapDisplay
            geojsonData={geojsonData}
          />
        </div>
      </div>
    </>
  )
}

export default App
