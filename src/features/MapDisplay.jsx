import { useState, useEffect } from 'react'
import Map, {Source, Layer, useMap, MapProvider, FullscreenControl, useControl} from 'react-map-gl/maplibre';
import LegendControl from 'mapboxgl-legend';

import layerConf, {staticLayerConf} from './layerConf';

import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapboxgl-legend/dist/style.css';
import '../index.css';

const MapDisplay = (props) => {
	const layerIDs = Object.keys({...staticLayerConf, ...layerConf})
	const [viewState, setViewState] = useState({
		longitude: -98.4,
		latitude: 39.5,
		zoom: 3
	});

	const { map } = useMap();

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

	let layersObj = {}
	layerIDs.forEach((layerID) => {
		// Default to collapsed in legend
		if(layerID === 'StageIV' || Object.keys(staticLayerConf).includes(layerID)) {
			layersObj[layerID] = {
				collapsed: true
			}
		} else {
			layersObj[layerID] = true
		}	
		
	})

	const legend = new LegendControl({
        layers: layersObj,
        toggler: true
    });
	return (
		<div className='fixed top-[113px] bottom-0 left-0 right-0'>
			<Map
		      {...viewState}
		      id="map"
		      onMove={evt => setViewState(evt.viewState)}
		      style={{width: '100%', height: '100%'}}
		      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		    >
		    	<LegendControlElement legend={legend}/>

		    	<Source id="cwa_bounds" type="vector" tiles={["http://localhost:3001/overlays/cwa_bounds/{z}/{x}/{y}.pbf"]}>
                  <Layer {...staticLayerConf["cwa_bounds"]} metadata={{name: "CWA Boundries", labels:{other:false}}}/>
                </Source>

               <Source id="rfc_bounds" type="vector" tiles={["http://localhost:3001/overlays/rfc_bounds/{z}/{x}/{y}.pbf"]}>
                  <Layer {...staticLayerConf["rfc_bounds"]} metadata={{name: "RFC Boundries", labels:{other:false}}}/>
                </Source>

                <Source id="county_bounds" type="vector" tiles={["http://localhost:3001/overlays/county_bounds/{z}/{x}/{y}.pbf"]}>
                  <Layer {...staticLayerConf["county_bounds"]} metadata={{name: "County Boundries", labels:{other:false}}}/>
                </Source>

                <Source id="FEMA_regions" type="vector" tiles={["http://localhost:3001/overlays/FEMA_regions/{z}/{x}/{y}.pbf"]}>
                  <Layer {...staticLayerConf["FEMA_regions"]} metadata={{name: "FEMA Regions", labels:{other:false}}}/>
                </Source>

		    	{props.geojsonData !== null ? 
		    		Object.keys(props.geojsonData).map((key) => {
			    		let layerData = props.geojsonData[key]
			    		return (
			    			<Source key={key} id={key} type="geojson" data={layerData}>
	                          <Layer source {...layerConf[key]} metadata={{name: key, labels:{other:false}}}/>
	                        </Source>
			    		)
		    		})
		    	:
		    		null
		    	}
		    	                

		    </Map>
		</div>
	)
}

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