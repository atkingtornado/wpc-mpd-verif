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
                '#ffffff',
                '0.10-0.20 ',
                '#ffffff',
                '0.20-0.30 ',
                '#ffffff',
                '0.30-0.40 ',
                '#c7e7c0',
                '0.40-0.50 ',
                '#c7e7c0',
                '0.50-0.60 ',
                '#c7e7c0',
                '0.60-0.70 ',
                '#c7e7c0',
                '0.70-0.80 ',
                '#a1e39b',
                '0.80-0.90 ',
                '#a1e39b',
                '0.90-1.00 ',
                '#a1e39b',
                '1.00-1.10 ',
                '#74c476',
                '1.10-1.20 ',
                '#74c476',
                '1.20-1.30 ',
                '#74c476',
                '1.30-1.40 ',
                '#31a353',
                '1.40-1.50 ',
                '#31a353',
                '1.50-1.60 ',
                '#31a353',
                '1.60-1.70 ',
                '#006d2c',
                '1.70-1.80 ',
                '#006d2c',
                '1.80-1.90 ',
                '#006d2c',
                '1.90-2.00 ',
                '#006d2c',
                '2.00-2.10 ',
                '#fffa8a',
                '2.10-2.20 ',
                '#fffa8a',
                '2.20-2.30 ',
                '#fffa8a',
                '2.30-2.40 ',
                '#ffcc4f',
                '2.40-2.50 ',
                '#ffcc4f',
                '2.50-2.60 ',
                '#ffcc4f',
                '2.60-2.70 ',
                '#fe8d3c',
                '2.70-2.80 ',
                '#fe8d3c',
                '2.80-2.90 ',
                '#fe8d3c',
                '2.90-3.00 ',
                '#fc4e2a',
                '3.00-3.10 ',
                '#fc4e2a',
                '3.10-3.20 ',
                '#fc4e2a',
                '3.20-3.30 ',
                '#fc4e2a',
                '3.30-3.40 ',
                '#d61a1c',
                '3.40-3.50 ',
                '#d61a1c',
                '3.50-3.60 ',
                '#d61a1c',
                '3.60-3.70 ',
                '#ad0026',
                '3.70-3.80 ',
                '#ad0026',
                '3.80-3.90 ',
                '#ad0026',
                '3.90-4.00 ',
                '#690000',
                '4.00-4.10 ',
                '#690000',
                '4.10-4.20 ',
                '#690000',
                '4.20-4.30 ',
                '#690000',
                '4.30-4.40 ',
                '#ffaafa',
                '4.40-4.50 ',
                '#ffaafa',
                '4.50-4.60 ',
                '#ffaafa',
                '4.60-4.70 ',
                '#ff83f9',
                '4.70-4.80 ',
                '#ff83f9',
                '4.80-4.90 ',
                '#ff83f9',
                '4.90-5.00 ',
                '#ff57f7',
                '5.00-5.10 ',
                '#ff57f7',
                '5.10-5.20 ',
                '#ff57f7',
                '5.20-5.30 ',
                '#e619f9',
                '5.30-5.40 ',
                '#e619f9',
                '5.40-5.50 ',
                '#e619f9',
                '5.50-5.60 ',
                '#e619f9',
                '5.60-5.70 ',
                '#9400cc',
                '5.70-5.80 ',
                '#9400cc',
                '5.80-5.90 ',
                '#9400cc',
                '>5.90 ',
                '#9400cc',
                /* other */ 'transparent'
            ],
            'fill-opacity': 0.5
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