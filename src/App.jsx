/**
 * @fileoverview Main application component for the MPD Verification tool
 * This file sets up the main application structure and state management
 */

import { useState, useEffect } from 'react'
import {MapProvider, Map, useMap} from 'react-map-gl/maplibre';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import queryString from 'query-string';

import { NavBar } from "@atkingtornado/wpc-navbar-reactjs";

import MapDisplay from "./features/MapDisplay"
import SelectionMenu from "./features/SelectionMenu"

import './App.css'

/**
 * Main application component
 * Manages the application state and renders the primary UI components
 * 
 * @component
 * @returns {JSX.Element} Rendered application
 */
function App() {

  /**
   * State for GeoJSON data to be displayed on the map
   * @type {[Object|null, Function]} State and setter for GeoJSON data
   */
  const [geojsonData, setGeojsonData] = useState(null)
  
  /**
   * State for the base data URL
   * @type {[string, Function]} State and setter for data URL
   */
  const [dataURL, setDataURL] = useState('')
  
  /**
   * State for parsed query string parameters
   * @type {[Object, Function]} State and setter for query string object
   */
  const [queryStringObj, setQueryStringObj] = useState({})
  
  /**
   * State to track if data should be loaded from query string
   * @type {[boolean, Function]} State and setter for loading from query string flag
   */
  const [loadFromQueryString, setLoadFromQueryString] = useState(false);
  
  /**
   * State to track if UI elements should be hidden
   * @type {[boolean, Function]} State and setter for UI visibility
   */
  const [uIIsHidden, setUIIsHidden] = useState(false);

  /**
   * Effect to initialize data URL and parse query string on component mount
   */
  useEffect(() => {
    const tmpDataUrl = window.location.href.indexOf("localhost") != -1 ? "http://localhost:3001/" : "https://origin.wpc.ncep.noaa.gov/verification/mpd_verif/"
    // const tmpDataUrl = "https://origin.wpc.ncep.noaa.gov/verification/mpd/"
    setDataURL(tmpDataUrl)
    setQueryStringObj(queryString.parse(location.search))
  },[])

  /**
   * Toggle visibility of UI elements
   */
  const toggleUIVisibility = () => {
    setUIIsHidden(!uIIsHidden)
  }

  /**
   * Update the GeoJSON data for the map
   * 
   * @param {Object} newData - New GeoJSON data to display on the map
   */
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
            <div className="z-20 fixed top-[170px] left-[10px]">
              <Tooltip 
                placement="right"
                title="Toggle UI Visibility"
              >
                <IconButton onClick={toggleUIVisibility} aria-label="delete">
                  { uIIsHidden ?
                    <VisibilityOffIcon />
                  :
                    <VisibilityIcon />
                  }
                </IconButton>
              </Tooltip>
            </div>
            <div className={ uIIsHidden ? 'hidden' : null}>
              <SelectionMenu 
                geojsonData={geojsonData} 
                handleMapDataChange={handleMapDataChange} 
                dataURL={dataURL}
                queryStringObj={queryStringObj}
                setQueryStringObj={setQueryStringObj}
                loadFromQueryString={loadFromQueryString}
                setLoadFromQueryString={setLoadFromQueryString}
              />
            </div>
            <MapDisplay
              dataURL={dataURL}
              geojsonData={geojsonData}
              queryStringObj={queryStringObj}
              loadFromQueryString={loadFromQueryString}
              setLoadFromQueryString={setLoadFromQueryString}
              uIIsHidden={uIIsHidden}
            />
          </div>
        </div>
      </MapProvider>
    </>
  )
}

export default App