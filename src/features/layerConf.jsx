const layerConf = {
	'ST4gARI': {
		id: 'ST4gARI',
        type: 'circle',
        layout: {
			// Make the layer invisible by default.
			'visibility': 'none'
		},
        paint: {
            'circle-color': 'red',
            'circle-opacity': 0.5
        }
    },
    'ST4gFFG': {
    	id: 'ST4gFFG',
        type: 'fill',
        layout: {
			// Make the layer invisible by default.
			'visibility': 'none'
		},
        paint: {
            'fill-color': 'blue',
            'fill-opacity': 0.5
        }
    },
    'FFW': {
    	id: 'FFW',
        type: 'fill',
        layout: {
			// Make the layer invisible by default.
			'visibility': 'none'
		},
        paint: {
            'fill-color': 'blue',
            'fill-opacity': 0.5
        }
    },
    'LSRFLASH': {
    	id: 'LSRFLASH',
        type: 'circle',
        layout: {
			// Make the layer invisible by default.
			'visibility': 'none'
		},
        paint: {
            'circle-color': '#38f9da',
            'circle-opacity': 0.5
        }
    },
    'LSRREG': {
    	id: 'LSRREG',
        type: 'circle',
        layout: {
			// Make the layer invisible by default.
			'visibility': 'none'
		},
        paint: {
            'circle-color': '#0a95ab',
            'circle-opacity': 0.5
        }
    },
    'USGS': {
    	id: 'USGS',
        type: 'circle',
        layout: {
			// Make the layer invisible by default.
			'visibility': 'none'
		},
        paint: {
            'circle-color': '#9e42f4',
            'circle-opacity': 0.5
        }
    },
    'MPD': {
		id: 'MPD',
	    type: 'line',
	    paint: {
	        'line-color': 'green',
	        'line-opacity': 0.8,
	        'line-width': 3
	    }
	},
}

export default layerConf