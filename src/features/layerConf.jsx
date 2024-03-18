const layerConf = {
    'StageIV': {
        id: 'StageIV',
        type: 'fill',
        layout: {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        paint: {
            // 'fill-color': ['get', 'fill'],
            'fill-color': [
                'match',
                ['get', 'title'],
                '<0.00 ',
                'transparent',
                '0.00-0.10 ',
                '#7cfc00',
                '0.10-0.25 ',
                '#32cd32',
                '0.25-0.50 ',
                '#228b22',
                '0.50-0.75 ',
                '#4682b4',
                '0.75-1.00 ',
                '#4169e1',
                '1.00-1.25 ',
                '#87ceeb',
                '1.25-1.50 ',
                '#00ffff',
                '1.50-1.75 ',
                '#8a2be2',
                '1.75-2.00 ',
                '#ba55d3',
                '2.00-2.50 ',
                '#c71585',
                '2.50-3.00 ',
                '#b22222',
                '3.00-4.00 ',
                '#ff0000',
                '4.00-5.00 ',
                '#ff4500',
                '5.00-7.00 ',
                '#ffa500',
                '7.00-10.00 ',
                '#b8860b',
                '10.00-20.00 ',
                '#ffd700',
                '>20.00 ',
                '#ffd700',
                /* other */ 'transparent'
            ],
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
            'fill-color': '#00FF00',
            'fill-opacity': 0.3,
            'fill-outline-color':'#009600'
        }
    },
    'FLW': {
        id: 'FLW',
        type: 'fill',
        layout: {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        paint: {
            'fill-color': '#00FF00',
            'fill-opacity': 0.3,
            'fill-outline-color':'#009600'
        }
    },
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
        type: 'circle',
        layout: {
			// Make the layer invisible by default.
			'visibility': 'none'
		},
        paint: {
            'circle-color': 'blue',
            'circle-opacity': 0.5
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

export const staticLayerConf = {
    'FEMA_regions': {
        id: 'FEMA_regions',
        'source-layer': 'FEMA_Regions',
        type: 'line',
        layout: {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        paint: {
            'line-color': 'black',
            'line-opacity': 0.5,
            'line-width': 1.5
        }
    },
    'rfc_bounds': {
        id: 'rfc_bounds',
        'source-layer': 'rfc_bounds',
        type: 'line',
        layout: {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        paint: {
            'line-color': 'black',
            'line-opacity': 0.5,
            'line-width': 1.5
        }
    },
    'county_bounds': {
        id: 'county_bounds',
        'source-layer': 'county_bounds',
        type: 'line',
        layout: {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        paint: {
            'line-color': 'black',
            'line-opacity': 0.3,
            'line-width': 0.5
        }
    },
    'cwa_bounds': {
        id: 'cwa_bounds',
        'source-layer': 'cwa_bounds',
        type: 'line',
        layout: {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        paint: {
            'line-color': 'black',
            'line-opacity': 0.5,
            'line-width': 1.5
        }
    }
}

export default layerConf