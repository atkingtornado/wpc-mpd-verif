import { useState, useEffect } from 'react'
import {MapProvider, Map, useMap} from 'react-map-gl/maplibre';
import Alert from '@mui/material/Alert';
import queryString from 'query-string';

import { NavBar } from "@atkingtornado/wpc-navbar-reactjs";

import MapDisplay from "./features/MapDisplay"
import SelectionMenu from "./features/SelectionMenu"

import './App.css'

function App() {

  const [geojsonData, setGeojsonData] = useState(null)
  const [dataURL, setDataURL] = useState('')
  const [queryStringObj, setQueryStringObj] = useState({})
  const [loadFromQueryString, setLoadFromQueryString] = useState(false);

  useEffect(() => {
    const tmpDataUrl = window.location.href.indexOf("localhost") != -1 ? "http://localhost:3001/" : "https://origin.wpc.ncep.noaa.gov/verification/mpd_verif/"
    // const tmpDataUrl = "https://origin.wpc.ncep.noaa.gov/verification/mpd/"
    setDataURL(tmpDataUrl)
    setQueryStringObj(queryString.parse(location.search))
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
              queryStringObj={queryStringObj}
              setQueryStringObj={setQueryStringObj}
              loadFromQueryString={loadFromQueryString}
              setLoadFromQueryString={setLoadFromQueryString}
            />
            <MapDisplay
              dataURL={dataURL}
              geojsonData={geojsonData}
              queryStringObj={queryStringObj}
              loadFromQueryString={loadFromQueryString}
              setLoadFromQueryString={setLoadFromQueryString}
            />
          </div>
        </div>
      </MapProvider>
    </>
  )
}

export default App
