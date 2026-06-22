/**
 * @fileoverview Main application component for the FFaIR IRW Verification tool.
 * Sets up the overall layout and shared state. Unlike the MPD verification site,
 * this spin-off is interactive-map only (no historical/aggregate statistics view).
 */

import { useState, useEffect } from 'react'
import { MapProvider } from 'react-map-gl/maplibre';
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
 * Base URL for the FFaIR IRW verification GeoJSON + Usernames data.
 *
 * Built from window.location.origin so it is an ABSOLUTE URL. This works in
 * production (the app is served same-origin as the data) and in local dev (Vite
 * proxies /verification to the WPC mirror — see vite.config.js). Absolute is
 * required for OVERLAY_URL below — see that note — and we keep DATA_URL absolute
 * for consistency.
 * @type {string}
 */
const DATA_URL = window.location.origin + "/verification/FFaIR_MPD/"

/**
 * Base URL for the shared boundary overlay vector tiles (CWA/county/RFC/FEMA).
 * These live with the MPD verification site; FFaIR_MPD has no overlays/ folder.
 *
 * This MUST be an absolute URL: MapLibre fetches vector tiles inside a Web
 * Worker, which has no document base URL, so a root-relative path like
 * "/verification/..." fails with "Failed to construct 'Request': Failed to parse
 * URL". window.location.origin yields the page origin (proxied to the WPC mirror
 * in dev; same-origin as the data in production).
 * @type {string}
 */
const OVERLAY_URL = window.location.origin + "/verification/mpd_verif/"

/**
 * Main application component.
 *
 * @component
 * @returns {JSX.Element} Rendered application
 */
function App() {

  /**
  * State for GeoJSON data to be displayed on the map
  * @type {[Object|null, Function]}
  */
  const [geojsonData, setGeojsonData] = useState(null)

  /**
  * State for parsed query string parameters
  * @type {[Object, Function]}
  */
  const [queryStringObj, setQueryStringObj] = useState({})

  /**
  * State to track if data should be loaded from query string
  * @type {[boolean, Function]}
  */
  const [loadFromQueryString, setLoadFromQueryString] = useState(false);

  /**
  * State to track if UI elements should be hidden
  * @type {[boolean, Function]}
  */
  const [uIIsHidden, setUIIsHidden] = useState(false);

  /**
   * Effect to parse the query string on component mount
   */
  useEffect(() => {
    setQueryStringObj(queryString.parse(location.search));
  }, []);

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
            <div>
              <div className="z-20 fixed top-[170px] left-[10px]">
                <Tooltip
                  placement="right"
                  title="Toggle UI Visibility"
                >
                  <IconButton onClick={toggleUIVisibility} aria-label="toggle ui visibility">
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
                  dataURL={DATA_URL}
                  queryStringObj={queryStringObj}
                  setQueryStringObj={setQueryStringObj}
                  loadFromQueryString={loadFromQueryString}
                  setLoadFromQueryString={setLoadFromQueryString}
                />
              </div>
              <MapDisplay
                dataURL={DATA_URL}
                overlayURL={OVERLAY_URL}
                geojsonData={geojsonData}
                queryStringObj={queryStringObj}
                loadFromQueryString={loadFromQueryString}
                setLoadFromQueryString={setLoadFromQueryString}
                uIIsHidden={uIIsHidden}
              />
            </div>
          </div>
        </div>
      </MapProvider>
    </>
  )
}

export default App
