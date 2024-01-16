import { useState } from 'react'
import Map from 'react-map-gl/maplibre';

import 'maplibre-gl/dist/maplibre-gl.css';

const MapDisplay = () => {

	return (
		<div className={'w-full h-[calc(100vh-113px)]'}>
			<Map
		      initialViewState={{
			      longitude: -98.4,
			      latitude: 39.5,
			      zoom: 3
			  }}
		      style={{width: '100%', height: '100%'}}
		      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		    />
		</div>
	)
}

export default MapDisplay