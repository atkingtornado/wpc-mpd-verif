import { useState, useEffect } from 'react'
import Map, {Source, Layer, useMap, MapProvider, FullscreenControl, useControl} from 'react-map-gl/maplibre';
import LegendControl from 'mapboxgl-legend';

import layerConf, {staticLayerConf} from './layerConf';

import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapboxgl-legend/dist/style.css';
import '../index.css';

/**
 * Extract all layer IDs for both static and dynamic layers
 * @type {string[]}
 */
const layerIDs = Object.keys({...staticLayerConf, ...layerConf})

/**
 * Configuration object for the map legend
 * @type {Object.<string, boolean|{collapsed: boolean}>}
 */
let layersObj = {}
layerIDs.forEach((productID) => {
	// Default to collapsed in legend
	if(productID === 'FLW' || productID === 'FFW' || productID === 'StageIV' || Object.keys(staticLayerConf).includes(productID)) {
		layersObj[productID] = {
			collapsed: true
		}
	} else {
		layersObj[productID] = true
	}	
})

/**
 * Legend control instance for the map
 * @type {LegendControl}
 */
const legend = new LegendControl({
      layers: layersObj,
      toggler: true,
      onToggle: (id, vis) => {console.log(id, vis)}
  });

/**
 * MapDisplay component that renders the interactive map with various data layers
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.dataURL - Base URL for data sources
 * @param {Object|null} props.geojsonData - GeoJSON data for various layers
 * @param {Object} props.queryStringObj - Query string parameters parsed as an object
 * @param {boolean} props.loadFromQueryString - Flag to indicate if map should load settings from query string
 * @param {Function} props.setLoadFromQueryString - Function to update loadFromQueryString state
 * @param {boolean} props.uIIsHidden - Flag to indicate if UI elements should be hidden
 * @returns {JSX.Element} Rendered component
 */
const MapDisplay = (props) => {
	
	/**
	 * State for map view (longitude, latitude, zoom)
	 */
	const [viewState, setViewState] = useState({
		longitude: -98.4,
		latitude: 39.5,
		zoom: 3
	});

	const { map } = useMap();

	/**
	 * Effect to center the map on MPD coordinates when geojsonData changes
	 */
	useEffect(() => {
		if(props.geojsonData !==  null) {
			try{
				let coordsArr = props.geojsonData['MPD'].features[0].geometry.coordinates
				let coordMean = coordsArr.reduce((acc, cur) => {
				    cur.forEach((e, i) => acc[i] = acc[i] ? acc[i] + e : e);
				    return acc;
				}, []).map(e => e / coordsArr.length);
				map.flyTo({center: coordMean, zoom:5});
				// setViewState({longitude:coordMean[0], latitude:coordMean[1], zoom:6})
			} catch (err) {
				console.log(err)
			}
		}
	},[props.geojsonData])

	/**
	 * Handle map initialization and apply settings from query string if needed
	 * 
	 * @param {Object} e - Map load event
	 */
	const handleMapUpdate = (e) => {
		if(props.loadFromQueryString) {
			if ('overlay' in props.queryStringObj) {
				let overlays = props.queryStringObj['overlay']
				if (!Array.isArray(overlays)) {
					overlays = [overlays]
				}
				overlays.forEach((overlayID) => {
					if (map.getLayer(overlayID)) {
						map.getMap().setLayoutProperty(overlayID, 'visibility', 'visible');
					}
				})
			}
			props.setLoadFromQueryString(false)
		}
	}


	return (
		<div className='fixed top-[160px] bottom-0 left-0 right-0'>
			<Map
		      {...viewState}
		      id="map"
		      onMove={evt => setViewState(evt.viewState)}
		      onLoad={handleMapUpdate}
		      style={{width: '100%', height: '100%'}}
		      mapStyle="https://api.maptiler.com/maps/188347a4-71db-46bf-837f-52a4188b469d/style.json?key=3g9gAaRe8ukSFBsBpU96"
		    >
		    {props.uIIsHidden ? 
		    	null
		    :
		    	<LegendControlElement legend={legend}/>
		    }

		    	{props.geojsonData !== null ? 
			    	<>
			    		<Source id="cwa_bounds" type="vector" tiles={[props.dataURL + "overlays/cwa_bounds/{z}/{x}/{y}.pbf"]}>
                <Layer {...staticLayerConf["cwa_bounds"]} metadata={{name: "CWA Boundries", labels:{other:false}}}/>
              </Source>

             	<Source id="rfc_bounds" type="vector" tiles={[props.dataURL + "overlays/rfc_bounds/{z}/{x}/{y}.pbf"]}>
                <Layer {...staticLayerConf["rfc_bounds"]} metadata={{name: "RFC Boundries", labels:{other:false}}}/>
              </Source>

              <Source id="county_bounds" type="vector" tiles={[props.dataURL + "overlays/county_bounds/{z}/{x}/{y}.pbf"]}>
                <Layer {...staticLayerConf["county_bounds"]} metadata={{name: "County Boundries", labels:{other:false}}}/>
              </Source>

              <Source id="FEMA_regions" type="vector" tiles={[props.dataURL + "overlays/FEMA_regions/{z}/{x}/{y}.pbf"]}>
                <Layer {...staticLayerConf["FEMA_regions"]} metadata={{name: "FEMA Regions", labels:{other:false}}}/>
              </Source>

			    		{Object.keys(props.geojsonData).map((key) => {
				    		let layerData = props.geojsonData[key]
				    		return (
				    			<Source key={key} id={key} type="geojson" data={layerData}>
                    <Layer source {...layerConf[key]} metadata={{name: key, labels:{other:false}}}/>
                  </Source>
				    		)
			    		})}
			    	</>
		    	:
		    		null
		    	}
		    	                

		    </Map>
		</div>
	)
}

/**
 * Component that adds a legend control to the map
 * 
 * @component
 * @param {Object} props - Component props
 * @param {LegendControl} props.legend - Legend control instance to add to the map
 * @returns {null} This component doesn't render any visible elements
 */
const LegendControlElement = (props) => {

    useControl(() => props.legend, {
        position: 'bottom-left',
        onRemove: () => {console.log("remove")},
        onAdd: () => {console.log("add")},
        onCreate: () => {console.log("create")},
    });

    return null
}


export default MapDisplay