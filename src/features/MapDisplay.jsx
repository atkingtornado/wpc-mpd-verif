import { useState } from 'react'
import Map, {Source, Layer, useMap, MapProvider, FullscreenControl, useControl} from 'react-map-gl/maplibre';
import LegendControl from 'mapboxgl-legend';

import layerConf from './layerConf';

import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapboxgl-legend/dist/style.css';
import '../index.css';

const MapDisplay = (props) => {

	const legend = new LegendControl({
        layers: Object.keys(layerConf),
        toggler: true
    });
	return (
		<div className='fixed top-[113px] bottom-0 left-0 right-0'>
			<Map
		      initialViewState={{
			      longitude: -98.4,
			      latitude: 39.5,
			      zoom: 3
			  }}
		      style={{width: '100%', height: '100%'}}
		      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		    >
		    	<LegendControlElement legend={legend}/>

		    	{Object.keys(props.geojsonData).map((key) => {
		    		let layerData = props.geojsonData[key]
		    		return (
		    			<Source key={key} id={key} type="geojson" data={layerData}>
                          <Layer {...layerConf[key]} metadata={{name: key, labels:{other:false}}}/>
                        </Source>
		    		)
		    	})}
		    	                

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