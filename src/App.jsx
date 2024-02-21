import { useState, useEffect } from 'react'
import {MapProvider, Map, useMap} from 'react-map-gl/maplibre';
import Alert from '@mui/material/Alert';

import { NavBar } from "@atkingtornado/wpc-navbar-reactjs";

import MapDisplay from "./features/MapDisplay"
import SelectionMenu from "./features/SelectionMenu"

import './App.css'

function App() {

  const [geojsonData, setGeojsonData] = useState(null)
  const [dataURL, setDataURL] = useState('')

  useEffect(() => {
    //const tmpDataUrl = window.location.href.indexOf("localhost") != -1 ? "http://localhost:3001/" : "https://www.wpc.ncep.noaa.gov/verification/mpd_verif/"
    const tmpDataUrl = "https://www.wpc.ncep.noaa.gov/verification/mpd_verif/"
    setDataURL(tmpDataUrl)
  },[])

  const handleMapDataChange = (newData) => {
    setGeojsonData(newData)
  }

  return (
    <>
      <MapProvider>
        <div className="App">
          <div className="relative">
            <div className="z-50 relative">
              <NavBar/>
            </div>
            <Alert className="z-20 relative flex justify-center" severity="error">****THIS IS A PROTOTYPE WEBSITE****</Alert>
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
      </MapProvider>
    </>
  )
}

export default App
