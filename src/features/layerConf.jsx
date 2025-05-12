/**
 * @fileoverview Configuration for dynamic map layers used in the application
 * This file defines the styling and behavior for various data layers
 */

/**
 * Configuration for dynamic map layers
 * 
 * @typedef {Object} LayerConfig
 * @property {string} id - Unique identifier for the layer
 * @property {string} type - Type of layer (fill, line, circle, etc.)
 * @property {Object} [layout] - Layout properties for the layer
 * @property {Object} paint - Visual styling properties for the layer
 */

/**
 * Dynamic layer configurations
 * 
 * @type {Object.<string, LayerConfig>}
 */
const layerConf = {
    /**
     * Stage IV precipitation data layer
     * Uses WPC color scale
     */
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
    
    /**
     * Flash Flood Warning layer
     */
    'FFW': {
        id: 'FFW',
        type: 'fill',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'fill-color': '#00FF00',
            'fill-opacity': 0.3,
            'fill-outline-color':'#009600'
        }
    },
    
    /**
     * Flood Warning layer
     */
    'FLW': {
        id: 'FLW',
        type: 'fill',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'fill-color': '#00FF00',
            'fill-opacity': 0.3,
            'fill-outline-color':'#009600'
        }
    },
    
    /**
     * Stage IV > Average Recurrence Interval layer
     */
    'ST4gARI': {
        id: 'ST4gARI',
        type: 'circle',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'circle-color': 'red',
            'circle-opacity': 0.5
        }
    },
    
    /**
     * Stage IV > Flash Flood Guidance layer
     */
    'ST4gFFG': {
        id: 'ST4gFFG',
        type: 'circle',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'circle-color': 'blue',
            'circle-opacity': 0.5
        }
    },
    
    /**
     * Local Storm Report Flash Flood layer
     */
    'LSRFLASH': {
        id: 'LSRFLASH',
        type: 'circle',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'circle-color': '#38f9da',
            'circle-opacity': 0.5
        }
    },
    
    /**
     * Local Storm Report Regular Flood layer
     */
    'LSRREG': {
        id: 'LSRREG',
        type: 'circle',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'circle-color': '#0a95ab',
            'circle-opacity': 0.5
        }
    },
    /**
     * mPing reports layer
     */
    'MPING': {
        id: 'MPING',
        type: 'circle',
        layout: {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        paint: {
            'circle-color': '#6495ed',
            'circle-opacity': 0.5
        }
    },
     /**
     * USGS Stream Gauge reports layer
     */
    'USGS': {
        id: 'USGS',
        type: 'circle',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'circle-color': '#9e42f4',
            'circle-opacity': 0.5
        }
    },
    
    /**
     * Mesoscale Precipitation Discussion (MPD) layer
     */
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

/**
 * Configuration for static/administrative boundary layers
 * 
 * @type {Object.<string, LayerConfig>}
 */
export const staticLayerConf = {
    /**
     * FEMA Regions boundary layer
     */
    'FEMA_regions': {
        id: 'FEMA_regions',
        'source-layer': 'FEMA_Regions',
        type: 'line',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'line-color': 'black',
            'line-opacity': 0.5,
            'line-width': 1.5
        }
    },
    
    /**
     * River Forecast Center boundaries layer
     */
    'rfc_bounds': {
        id: 'rfc_bounds',
        'source-layer': 'rfc_bounds',
        type: 'line',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'line-color': 'black',
            'line-opacity': 0.5,
            'line-width': 1.5
        }
    },
    
    /**
     * County boundaries layer
     */
    'county_bounds': {
        id: 'county_bounds',
        'source-layer': 'county_bounds',
        type: 'line',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'line-color': 'black',
            'line-opacity': 0.3,
            'line-width': 0.5
        }
    },
    
    /**
     * County Warning Area boundaries layer
     */
    'cwa_bounds': {
        id: 'cwa_bounds',
        'source-layer': 'cwa_bounds',
        type: 'line',
        layout: {
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