/**
 * @fileoverview Selection menu for the FFaIR IRW Verification tool.
 *
 * Selection flow: valid date -> forecaster (username) -> IRW (by valid time).
 *
 * The set of forecasters for a given date comes from the per-day Usernames JSON.
 * The set of IRWs (valid-time windows) for a forecaster is derived by parsing the
 * flat `2026/MPD_contour/` directory listing once into an in-memory index — see
 * loadIrwIndex(). That single function is the only place that knows how IRWs are
 * enumerated, so it can be swapped for a JSON index later with minimal change.
 */

import { useState, useEffect, useRef } from 'react'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMap } from 'react-map-gl/maplibre';
import axios from 'axios';
import queryString from 'query-string';
import copy from 'copy-to-clipboard';

import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import ShareIcon from '@mui/icons-material/Share';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Select from 'react-select';
import DatePicker from "react-datepicker";

import layerConf, { staticLayerConf } from './layerConf';

import "react-datepicker/dist/react-datepicker.css";

// Extend dayjs with plugins (customParseFormat is required to parse the
// YYYYMMDDHH valid-time stamps embedded in the IRW file names)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

/** Year folder the FFaIR experiment data lives under. */
const YEAR = '2026'

/** Earliest selectable valid date (start of the experiment window). */
const MIN_DATE = dayjs(`${YEAR}-06-01`, 'YYYY-MM-DD').toDate()

/**
 * Parse a YYYYMMDDHH valid-time stamp into a UTC dayjs object.
 *
 * @param {string} t - 10-character YYYYMMDDHH string
 * @returns {dayjs.Dayjs}
 */
const parseIrwTime = (t) => dayjs.utc(t, 'YYYYMMDDHH')

/**
 * Build a human-readable label for an IRW valid window,
 * e.g. "18Z Jun 12 → 00Z Jun 13".
 *
 * @param {string} begin - YYYYMMDDHH start
 * @param {string} end - YYYYMMDDHH end
 * @returns {string}
 */
const formatIrwWindow = (begin, end) => {
    const b = parseIrwTime(begin)
    const e = parseIrwTime(end)
    return `${b.format('HH')}Z ${b.format('MMM D')} → ${e.format('HH')}Z ${e.format('MMM D')}`
}

/**
 * Create a react-select option object.
 *
 * @param {string|number} label - Option label
 * @param {string|number} [value] - Option value (defaults to label)
 * @returns {{label: (string|number), value: (string|number)}}
 */
const createOption = (label, value) => ({
    label,
    value: value === undefined ? label : value,
});

/**
 * Selection menu component for choosing an IRW by date, forecaster, and valid time.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object|null} props.geojsonData - Current GeoJSON data displayed on the map
 * @param {Function} props.handleMapDataChange - Function to update map data
 * @param {string} props.dataURL - Base URL for data sources
 * @param {Object} props.queryStringObj - Query string parameters parsed as an object
 * @param {Function} props.setQueryStringObj - Function to update query string object
 * @param {boolean} props.loadFromQueryString - Flag to indicate if data should be loaded from query string
 * @param {Function} props.setLoadFromQueryString - Function to update loadFromQueryString state
 * @returns {JSX.Element} Rendered component
 */
const SelectionMenu = (props) => {

    /** Selected valid date. @type {[Date|null, Function]} */
    const [irwDate, setIrwDate] = useState(null);

    /** Forecaster options for the selected date. @type {[Array|null, Function]} */
    const [usernameOptions, setUsernameOptions] = useState(null);

    /** Selected forecaster. @type {[Object|null, Function]} */
    const [selectedUsername, setSelectedUsername] = useState(null);

    /** IRW options for the selected forecaster + date. @type {[Array|null, Function]} */
    const [irwOptions, setIrwOptions] = useState(null);

    /** Selected IRW (carries username/begin/end). @type {[Object|null, Function]} */
    const [selectedIrw, setSelectedIrw] = useState(null);

    /** Metadata from the loaded IRW contour file. @type {[Object|null, Function]} */
    const [irwMetadata, setIrwMetadata] = useState(null);

    /** Selection-level error message. @type {[string|null, Function]} */
    const [errMsg, setErrMsg] = useState(null);

    /** Data-load error message. @type {[string|null, Function]} */
    const [dataLoadErrMsg, setDataLoadErrMsg] = useState(null);

    /** Whether data is currently being fetched. @type {[boolean, Function]} */
    const [dataIsFetching, setDataIsFetching] = useState(false);

    /**
     * Full index of every IRW in the experiment, parsed once from the
     * MPD_contour directory listing: { username: [ {begin, end}, ... ] }
     * (each list sorted ascending by begin time). Held in a ref since it never
     * needs to trigger a re-render on its own.
     * @type {React.MutableRefObject<Object|null>}
     */
    const irwIndex = useRef(null);

    const { map } = useMap();

    /**
     * Load the IRW index (directory listing) once on mount.
     */
    useEffect(() => {
        loadIrwIndex()
    }, [])

    /**
     * When the date changes, fetch that day's forecaster roster.
     */
    useEffect(() => {
        if (irwDate !== null) {
            fetchUsernamesForDate()
        }
    }, [irwDate])

    /**
     * When the forecaster (or date) changes, recompute the IRW dropdown.
     */
    useEffect(() => {
        if (selectedUsername !== null && irwDate !== null) {
            refreshIrwOptions(selectedUsername.value)
        }
    }, [selectedUsername])

    /**
     * Load data from a share link query string, if present.
     */
    useEffect(() => {
        const qs = props.queryStringObj
        if (qs && 'date' in qs && 'user' in qs && 'begin' in qs && 'end' in qs) {
            props.setLoadFromQueryString(true)
            setIrwDate(dayjs(qs['date'], 'YYYYMMDD').toDate())
        }
    }, [props.queryStringObj])

    /**
     * While loading from a share link, submit once the IRW has been resolved.
     */
    useEffect(() => {
        if (props.loadFromQueryString && selectedIrw !== null) {
            handleSubmit()
        }
    }, [selectedIrw])

    /**
     * Fetch and parse the flat MPD_contour directory listing into an in-memory
     * index of every IRW. This is the single source of IRW enumeration.
     */
    const loadIrwIndex = async () => {
        try {
            const resp = await axios.get(`${props.dataURL}${YEAR}/MPD_contour/`)
            const html = typeof resp.data === 'string' ? resp.data : ''
            const re = /MPD_contour_2026_(.+?)_(\d{10})_(\d{10})\.geojson/g
            const index = {}
            const seen = new Set()
            let m
            while ((m = re.exec(html)) !== null) {
                const [, username, begin, end] = m
                const key = `${username}_${begin}_${end}`
                if (seen.has(key)) continue
                seen.add(key)
                if (!index[username]) index[username] = []
                index[username].push({ begin, end })
            }
            Object.values(index).forEach((list) => list.sort((a, b) => a.begin.localeCompare(b.begin)))
            irwIndex.current = index

            // If a forecaster was already selected (e.g. share link resolved the
            // username before the index finished loading), refresh now.
            if (selectedUsername !== null && irwDate !== null) {
                refreshIrwOptions(selectedUsername.value)
            }
        } catch (err) {
            console.log(err)
            irwIndex.current = {}
        }
    }

    /**
     * Fetch the forecaster roster for the selected valid date.
     */
    const fetchUsernamesForDate = () => {
        setDataIsFetching(true)
        const dateStr = dayjs(irwDate).format('YYYYMMDD')

        axios.get(`${props.dataURL}Usernames/FFaIR_usernames_${dateStr}.json`)
            .then((response) => {
                const tmp = (response.data['usernames'] || []).map((u) => createOption(u))
                setUsernameOptions(tmp)
                setErrMsg(null)
                setDataIsFetching(false)

                // If loading from a share link, select the requested forecaster.
                if (props.loadFromQueryString) {
                    setSelectedUsername(createOption(props.queryStringObj['user']))
                }
            })
            .catch((error) => {
                console.log(error)
                if (error.response && error.response.status === 404) {
                    setErrMsg('No forecasters found for ' + dateStr)
                } else {
                    setErrMsg('Error fetching forecasters')
                }
                setUsernameOptions(null)
                setDataIsFetching(false)
            })
    }

    /**
     * Recompute the IRW dropdown for a forecaster on the selected date.
     *
     * @param {string} username - Selected forecaster username
     */
    const refreshIrwOptions = (username) => {
        const index = irwIndex.current || {}
        const dateStr = dayjs(irwDate).format('YYYYMMDD')
        const list = (index[username] || []).filter((irw) => irw.begin.substring(0, 8) === dateStr)
        const opts = list.map((irw) => ({
            label: formatIrwWindow(irw.begin, irw.end),
            value: `${username}_${irw.begin}_${irw.end}`,
            username,
            begin: irw.begin,
            end: irw.end,
        }))
        setIrwOptions(opts)

        // If loading from a share link, select the requested IRW window.
        if (props.loadFromQueryString) {
            const qs = props.queryStringObj
            const match = opts.find((o) => o.begin === qs['begin'] && o.end === qs['end'])
            if (match) {
                setSelectedIrw(match)
            }
        }
    }

    /**
     * Fetch a single layer's GeoJSON for a given IRW.
     *
     * File naming (under {dataURL}2026/{folder}/):
     *   - IRW outline: MPD_contour/MPD_contour_2026_{key}.geojson
     *   - StageIV/FFW/FLW: {OBS}_2026_{key}.geojson           (no _20km_)
     *   - MPING: MPING_fullday_2026_{key}.geojson
     *   - everything else: {OBS}_20km_2026_{key}.geojson
     * where {key} = "{username}_{begin}_{end}".
     *
     * @param {string} productID - Layer key from layerConf
     * @param {string} irwKey - "{username}_{begin}_{end}"
     * @returns {Promise} Axios response promise
     */
    const fetchGeojsonData = (productID, irwKey) => {
        let folder = productID
        let file

        if (productID === 'IRW') {
            folder = 'MPD_contour'
            file = `MPD_contour_${YEAR}_${irwKey}.geojson`
        } else if (productID === 'FLW' || productID === 'FFW' || productID === 'StageIV') {
            file = `${productID}_${YEAR}_${irwKey}.geojson`
        } else if (productID === 'MPING') {
            file = `MPING_fullday_${YEAR}_${irwKey}.geojson`
        } else {
            file = `${productID}_20km_${YEAR}_${irwKey}.geojson`
        }

        return axios.get(`${props.dataURL}${YEAR}/${folder}/${file}`)
    }

    /**
     * Load all layer GeoJSON for a specific IRW and push it to the map. Also keeps
     * the menu selections (date / forecaster / IRW) in sync — used both by the
     * Submit button and the prev/next navigation.
     *
     * @param {string} username - Forecaster username
     * @param {string} begin - YYYYMMDDHH start
     * @param {string} end - YYYYMMDDHH end
     */
    const loadIrw = (username, begin, end) => {
        setDataIsFetching(true)

        const irwKey = `${username}_${begin}_${end}`
        const productIDs = Object.keys(layerConf)
        const allPromises = productIDs.map((productID) => fetchGeojsonData(productID, irwKey))

        Promise.allSettled(allPromises).then((results) => {
            const tmpGeojsonData = {}
            const allErrors = []

            results.forEach((result, i) => {
                const productID = productIDs[i]
                if (result.status === 'fulfilled') {
                    tmpGeojsonData[productID] = result.value.data
                    if (productID === 'IRW') {
                        setIrwMetadata(result.value.data && result.value.data['metadata'] ? result.value.data['metadata'] : null)
                    }
                } else {
                    // A 404 just means this IRW has no obs of that type — normal for
                    // sparse FFaIR data, so don't surface it as an error. Only flag
                    // genuine failures (5xx, network, etc.).
                    const status = result.reason && result.reason.response ? result.reason.response.status : null
                    if (status !== 404) {
                        allErrors.push(productID)
                    }
                    if (productID === 'IRW') {
                        setIrwMetadata(null)
                    }
                }
            })

            props.handleMapDataChange(tmpGeojsonData)
            setErrMsg(null)
            setDataIsFetching(false)
            setDataLoadErrMsg(allErrors.length !== 0 ? 'Error loading data for: ' + allErrors.toString() : null)

            if (props.loadFromQueryString) {
                props.setLoadFromQueryString(false)
            }

            // Keep menu selections in sync (e.g. after prev/next navigation).
            // Guard with same-value checks so we don't re-trigger effects/loops.
            setSelectedUsername((prev) => (prev && prev.value === username) ? prev : createOption(username))
            setSelectedIrw((prev) => (prev && prev.value === irwKey)
                ? prev
                : { label: formatIrwWindow(begin, end), value: irwKey, username, begin, end })
            if (!irwDate || dayjs(irwDate).format('YYYYMMDD') !== begin.substring(0, 8)) {
                setIrwDate(parseIrwTime(begin).toDate())
            }
        })
    }

    /**
     * Handle form submission to load the selected IRW.
     */
    const handleSubmit = () => {
        if (selectedIrw === null) return
        loadIrw(selectedIrw.username, selectedIrw.begin, selectedIrw.end)
    }

    /**
     * Navigate to the previous/next IRW for the current forecaster, ordered by
     * valid time (crossing dates as needed).
     *
     * @param {number} step - -1 for previous, +1 for next
     */
    const navigateIrw = (step) => {
        if (selectedIrw === null) return
        const list = (irwIndex.current || {})[selectedIrw.username] || []
        const idx = list.findIndex((x) => x.begin === selectedIrw.begin && x.end === selectedIrw.end)
        if (idx === -1) return
        const target = list[idx + step]
        if (!target) return
        loadIrw(selectedIrw.username, target.begin, target.end)
    }

    /**
     * Handle date change in the date picker (resets downstream selections).
     *
     * @param {Date} newDate - Newly selected date
     */
    const handleDateChange = (newDate) => {
        setIrwDate(newDate)
        setSelectedUsername(null)
        setSelectedIrw(null)
        setIrwOptions(null)
    }

    /**
     * Handle forecaster change (resets the IRW selection).
     *
     * @param {Object} newValue - Newly selected forecaster option
     */
    const handleUsernameChange = (newValue) => {
        setSelectedUsername(newValue)
        setSelectedIrw(null)
    }

    // Determine whether prev/next navigation is available for the current IRW.
    let hasPrev = false
    let hasNext = false
    if (selectedIrw && irwIndex.current) {
        const list = irwIndex.current[selectedIrw.username] || []
        const idx = list.findIndex((x) => x.begin === selectedIrw.begin && x.end === selectedIrw.end)
        hasPrev = idx > 0
        hasNext = idx > -1 && idx < list.length - 1
    }

    return (
        <>
            {dataIsFetching ?
                <div className='fixed flex top-1/2 left-1/2 z-10 transform -translate-y-[-40px] z-20' >
                    <CircularProgress />
                </div>
            :
                null
            }
            <div className='flex relative ml-auto mr-5 mt-5 z-10 flex-col rounded bg-slate-900/60 w-[250px] p-3 shadow-md'>
                <div className='mb-2 text-center flex flex-row justify-center items-center'>
                    <p className='text-white text-2xl font-bold'>IRW Verification</p>
                </div>
                <Divider/>

                {/* Step 1: valid date */}
                <div className='mt-3 mb-2 ml-2 mr-2'>
                    <DatePicker
                        wrapperClassName='w-full'
                        className='w-full rounded pl-2 pr-2 pt-2 pb-2 placeholder-[#808080]'
                        placeholderText="IRW Valid Date"
                        selected={irwDate}
                        onChange={(date) => handleDateChange(date)}
                        minDate={MIN_DATE}
                        maxDate={dayjs().toDate()}
                    />
                </div>

                {/* Step 2: forecaster */}
                {irwDate !== null && usernameOptions !== null ?
                    <div className='mb-2 ml-2 mr-2'>
                        <Select
                            placeholder="Forecaster"
                            options={usernameOptions}
                            value={selectedUsername}
                            onChange={handleUsernameChange}
                        />
                    </div>
                :
                    null
                }

                {/* Step 3: IRW (by valid time) */}
                {selectedUsername !== null && irwOptions !== null ?
                    irwOptions.length > 0 ?
                        <div className='mb-2 ml-2 mr-2'>
                            <Select
                                placeholder="IRW (valid time)"
                                options={irwOptions}
                                value={selectedIrw}
                                onChange={(newValue) => setSelectedIrw(newValue)}
                            />
                        </div>
                    :
                        <div className='mb-2 ml-2 mr-2'>
                            <Alert severity="info">No IRWs for this forecaster on the selected date.</Alert>
                        </div>
                :
                    null
                }

                <div className='mt-4 w-full'>
                    <Button
                        onClick={handleSubmit}
                        disabled={dataIsFetching || selectedIrw === null}
                        className='w-full'
                        variant="contained"
                    >
                        Submit
                    </Button>
                </div>

                {errMsg !== null ?
                    <div className='mt-4'>
                        <Alert severity="error">{errMsg}</Alert>
                    </div>
                :
                    null
                }
            </div>

            {props.geojsonData !== null ?
                <>
                    <MetadataDisplay
                        dataIsFetching={dataIsFetching}
                        irwMetadata={irwMetadata}
                        selectedIrw={selectedIrw}
                        navigateIrw={navigateIrw}
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                    />
                    <ShareMenu selectedIrw={selectedIrw} />
                </>
            :
                null
            }

            {dataLoadErrMsg !== null ?
                <div className='fixed bottom-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10'>
                    <Alert severity="error">{dataLoadErrMsg}</Alert>
                </div>
            :
                null
            }
        </>
    )
}

/**
 * Safely format a numeric metadata value to a fixed number of decimals.
 *
 * @param {*} val - Raw value (number or numeric string)
 * @param {number} [digits=3] - Decimal places
 * @returns {string} Formatted value or an em dash if not a number
 */
const fmtNum = (val, digits = 3) => {
    const n = parseFloat(val)
    return Number.isFinite(n) ? n.toFixed(digits) : '—'
}

/**
 * Safely format an integer metadata value.
 *
 * @param {*} val - Raw value (number or numeric string)
 * @returns {string} Formatted integer or an em dash if not a number
 */
const fmtInt = (val) => {
    const n = parseInt(val)
    return Number.isFinite(n) ? String(n) : '—'
}

/**
 * Clean up the valid-time strings produced by the pipeline (e.g. "06::00Z").
 *
 * @param {string} val - Raw valid-time string
 * @returns {string}
 */
const cleanValidTime = (val) => (typeof val === 'string' ? val.replace('::', ':') : val)

/**
 * Component to display IRW metadata and prev/next navigation controls.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.dataIsFetching - Flag indicating if data is being fetched
 * @param {Object|null} props.irwMetadata - Metadata for the current IRW
 * @param {Object|null} props.selectedIrw - Currently selected IRW (username/begin/end)
 * @param {Function} props.navigateIrw - Function to move to the prev/next IRW
 * @param {boolean} props.hasPrev - Whether a previous IRW exists
 * @param {boolean} props.hasNext - Whether a next IRW exists
 * @returns {JSX.Element} Rendered component
 */
const MetadataDisplay = (props) => {
    const forecaster = props.selectedIrw ? props.selectedIrw.username : (props.irwMetadata ? props.irwMetadata['MPD_number'] : '')

    return (
        <div className='fixed flex top-[181px] rounded bg-slate-900/60 p-1 shadow-md left-1/2 transform -translate-x-1/2 z-10'>
            <Tooltip
                placement="left"
                title="Previous IRW"
            >
                <div className='cursor-pointer self-center text-white h-full'>
                    <Button onClick={()=>{props.navigateIrw(-1)}} disabled={props.dataIsFetching || !props.hasPrev} style={{color: 'white'}}>
                        <ChevronLeftIcon fontSize="large"/>
                    </Button>
                </div>
            </Tooltip>
            { props.irwMetadata !== null ?
                <div className='h-full'>
                    <p className='text-white text-center text-sm pt-1 pb-1'>{'Forecaster: ' + forecaster}</p>
                    <p className='text-white text-xs'>
                        <span className='underline mr-2 font-bold'>Valid Start:</span>
                        <span className='float-right'>{cleanValidTime(props.irwMetadata['valid_start'])}</span>
                    </p>
                    <p className='text-white text-xs mb-2'>
                        <span className='underline mr-2 font-bold'>Valid End:</span>
                        <span className='float-right'>{cleanValidTime(props.irwMetadata['valid_end'])}</span>
                    </p>
                    <div className='mb-2 pt-1'>
                        <Accordion
                            sx={{backgroundColor:'transparent', boxShadow:'none', outline:'1px solid #0f172a99'}}
                            defaultExpanded={true}
                        >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon sx={{color:'white'}} />}
                              aria-controls="panel1-content"
                              id="panel1-header"
                            >
                                <Divider><p className='text-white font-bold text-sm underline'>Statistics</p></Divider>
                            </AccordionSummary>
                            <AccordionDetails sx={{paddingTop:'0px', paddingBottom:'10px'}}>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max Stage IV Accumulated Rainfall:</span>
                                    <span className='float-right'>{fmtNum(props.irwMetadata['Max_Rain_Accumulation'])}</span>
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max Stage IV Rain Rate:</span>
                                    <span className='float-right'>{fmtNum(props.irwMetadata['Max_Rain_Rate'])}</span>
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max Unit Q:</span>
                                    <span className='float-right'>{fmtNum(props.irwMetadata['Max_Unit_Q'])}</span>
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Mean Unit Q:</span>
                                    <span className='float-right'>{fmtNum(props.irwMetadata['Mean_Unit_Q'])}</span>
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max 1-hr ARI:</span>
                                    <span className='float-right'>{fmtInt(props.irwMetadata['Max_Hourly_ARI'])}</span>
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max ARI Year:</span>
                                    <span className='float-right'>{fmtInt(props.irwMetadata['Max_ARI_Year'])}</span>
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max ARI Year Duration:</span>
                                    <span className='float-right'>{fmtInt(props.irwMetadata['Max_ARI_Dur'])}</span>
                                </p>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </div>
            :
                null
            }

            <Tooltip
                placement="right"
                title="Next IRW"
            >
                <div className='cursor-pointer self-center text-white h-full'>
                    <Button onClick={()=>{props.navigateIrw(1)}} disabled={props.dataIsFetching || !props.hasNext} style={{color: 'white'}}>
                        <ChevronRightIcon fontSize="large"/>
                    </Button>
                </div>
            </Tooltip>
        </div>
    )
}

/**
 * Component to generate and share a link to the current IRW view.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object|null} props.selectedIrw - Currently selected IRW (username/begin/end)
 * @returns {JSX.Element} Rendered component
 */
const ShareMenu = (props) => {
    /** Dialog open state. @type {[boolean, Function]} */
    const [open, setOpen] = useState(false);

    /** Generated share URL. @type {[string|null, Function]} */
    const [shareURL, setShareURL] = useState(null);

    /** Whether the URL has been copied. @type {[boolean, Function]} */
    const [hasCopied, setHasCopied] = useState(false);

    const { map } = useMap();

    /** Close the share dialog. */
    const handleClose = () => {
        setOpen(false);
        setHasCopied(false)
    };

    /** Open the share dialog and generate the share link. */
    const handleOpen = () => {
        genShareLink()
        setOpen(true)
    }

    /** Generate a shareable link to the current IRW view. */
    const genShareLink = () => {
        if (props.selectedIrw !== null) {
            let tmpShareURL = window.location.origin + window.location.pathname
            const activeOverlays = []
            const layerIDs = Object.keys({ ...staticLayerConf, ...layerConf })

            // Determine which overlays are visible and add them to the query string.
            layerIDs.forEach((overlayID) => {
                if (overlayID !== 'IRW' && map.getLayer(overlayID)) {
                    if (map.getLayoutProperty(overlayID, 'visibility') === 'visible') {
                        activeOverlays.push(overlayID)
                    }
                }
            })

            const tmpQueryStringObj = {
                'date': props.selectedIrw.begin.substring(0, 8),
                'user': props.selectedIrw.username,
                'begin': props.selectedIrw.begin,
                'end': props.selectedIrw.end,
                'overlay': activeOverlays
            }
            tmpShareURL += '?' + queryString.stringify(tmpQueryStringObj)

            setShareURL(tmpShareURL)
        }
    }

    /** Copy the share URL to clipboard. */
    const copyToClipboard = () => {
        copy(shareURL);
        setHasCopied(true)
    }

    return (
        <>
            <div className='fixed bottom-10 right-5 z-10'>
                <Fab onClick={handleOpen} color="primary" aria-label="share">
                  <ShareIcon />
                </Fab>
            </div>
            <Dialog fullWidth onClose={handleClose} open={open}>
                <DialogTitle>Share Link</DialogTitle>
                <DialogContent>
                    <div className='flex'>
                        <TextField
                            fullWidth
                            type='text'
                            value={shareURL}
                            variant='outlined'
                            inputProps={
                                { readOnly: true, }
                            }
                        />
                        <div className='self-center ml-2'>
                            <IconButton onClick={copyToClipboard} size="large" aria-label="copy">
                              <ContentCopyIcon />
                            </IconButton>
                        </div>
                    </div>
                    {hasCopied ?
                        <div className='mt-2'>
                            <Alert severity="success">Link copied to clipboard.</Alert>
                        </div>
                    :
                        null
                    }
                </DialogContent>
            </Dialog>
        </>
    )
}

export default SelectionMenu
