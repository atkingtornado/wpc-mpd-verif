import { useState, useEffect } from 'react'
import Map, {Source, Layer, useMap, MapProvider, FullscreenControl, useControl} from 'react-map-gl/maplibre';
import LegendControl from 'mapboxgl-legend';

import layerConf from './layerConf';

import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapboxgl-legend/dist/style.css';
import '../index.css';

const MapDisplay = (props) => {
	const layerIDs = Object.keys(layerConf)
	const [viewState, setViewState] = useState({
		longitude: -98.4,
		latitude: 39.5,
		zoom: 3
	});

	const { map } = useMap();

	useEffect(() => {
		if(props.geojsonData !==  null) {
			console.log(props.geojsonData)
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
		if(layerID === 'StageIV') {
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

		    	{props.geojsonData !== null ? 
		    		Object.keys(props.geojsonData).map((key) => {
		    		let layerData = props.geojsonData[key]
		    		return (
		    			<Source key={key} id={key} type="geojson" data={layerData}>
                          <Layer {...layerConf[key]} metadata={{name: key, labels:{other:false}}}/>
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