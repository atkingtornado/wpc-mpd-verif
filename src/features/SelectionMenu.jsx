/**
 * @fileoverview Selection menu for the FFaIR IRW Verification tool.
 *
 * Selection flow: issuance date -> forecaster (username) -> forecast day (toggle)
 * -> IRW (by valid time).
 *
 * For each issuance date there is a JSON at
 *   Usernames/FFaIR_usernames_and_validtimes_YYYYMMDD.json
 * whose top-level keys are usernames and whose values are arrays of filename
 * substrings of the form "day{N}_id{N}_{START}_{END}" (START/END are YYYYMMDDHH;
 * one per IRW that forecaster issued that day). A substring is combined with the
 * username to build the GeoJSON file names, e.g.
 *   MPD_contour_2026_DRJ_day2_id1_2026062217_2026062223.geojson
 * The Day 1/2/3 toggle filters a forecaster's IRWs by the "day{N}" prefix.
 */

import { useState, useEffect } from 'react'

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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
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
// YYYYMMDDHH valid-time stamps embedded in the IRW substrings)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

/** Year folder the FFaIR experiment data lives under. */
const YEAR = '2026'

/** Earliest selectable issuance date (start of the experiment window). */
const MIN_DATE = dayjs(`${YEAR}-06-01`, 'YYYY-MM-DD').toDate()

/** Forecast-day toggle options. */
const DAY_OPTIONS = [
    { value: 'day1', label: 'Day 1' },
    { value: 'day2', label: 'Day 2' },
    { value: 'day3', label: 'Day 3' },
]

/**
 * Parse an IRW filename substring of the form "day{N}_id{N}_{START}_{END}"
 * (START/END are YYYYMMDDHH). The "id{N}" token is optional so the older
 * "day{N}_{START}_{END}" and "day{N}_st{START}_et{END}" forms still parse for
 * backwards compatibility.
 *
 * @param {string} s - The substring
 * @returns {{day: string, id: string|null, start: string, end: string}|null} Parsed parts, or null if malformed
 */
const parseSubstring = (s) => {
    const m = /^(day\d+)_(?:(id\d+)_)?(?:st)?(\d{10})_(?:et)?(\d{10})$/.exec(s || '')
    if (!m) return null
    return { day: m[1], id: m[2] || null, start: m[3], end: m[4] }
}

/**
 * Normalize an IRW substring into the form used in the GeoJSON file names,
 * "day{N}_id{N}_{START}_{END}". Current files include the "id{N}" token; older
 * files omitted it (and the oldest used "st"/"et" markers, which are dropped
 * here). Falls back to the raw substring if it can't parse.
 *
 * @param {string} substring - The IRW substring
 * @returns {string}
 */
const substringToFileKey = (substring) => {
    const p = parseSubstring(substring)
    if (!p) return substring
    return p.id ? `${p.day}_${p.id}_${p.start}_${p.end}` : `${p.day}_${p.start}_${p.end}`
}

/**
 * Parse a YYYYMMDDHH valid-time stamp into a UTC dayjs object.
 *
 * @param {string} t - 10-character YYYYMMDDHH string
 * @returns {dayjs.Dayjs}
 */
const parseIrwTime = (t) => dayjs.utc(t, 'YYYYMMDDHH')

/**
 * Build a human-readable label for an IRW valid window,
 * e.g. "18Z Jun 15 → 00Z Jun 16".
 *
 * @param {string} start - YYYYMMDDHH start
 * @param {string} end - YYYYMMDDHH end
 * @returns {string}
 */
const formatIrwWindow = (start, end) => {
    const b = parseIrwTime(start)
    const e = parseIrwTime(end)
    return `${b.format('HH')}Z ${b.format('MMM D')} → ${e.format('HH')}Z ${e.format('MMM D')}`
}

/**
 * Build a react-select option object for an IRW substring. When the substring
 * carries an "id{N}" token, the id number is appended to the label so multiple
 * IRWs sharing the same valid window remain distinguishable in the dropdown.
 *
 * @param {string} username - Forecaster username
 * @param {string} substring - "day{N}_id{N}_{START}_{END}" substring
 * @returns {Object|null} Option object, or null if the substring is malformed
 */
const makeIrwOption = (username, substring) => {
    const p = parseSubstring(substring)
    if (!p) return null
    const window = formatIrwWindow(p.start, p.end)
    return {
        label: p.id ? `${window} (ID ${p.id.replace('id', '')})` : window,
        value: substring,
        username,
        substring,
        day: p.day,
        id: p.id,
        begin: p.start,
        end: p.end,
    }
}

/**
 * Create a simple react-select option object.
 *
 * @param {string|number} label - Option label (also used as value)
 * @returns {{label: (string|number), value: (string|number)}}
 */
const createOption = (label) => ({ label, value: label });

/**
 * Selection menu component for choosing an IRW by issuance date, forecaster,
 * forecast day, and valid time.
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

    /** Selected issuance date. @type {[Date|null, Function]} */
    const [issuanceDate, setIssuanceDate] = useState(null);

    /** Selected forecast day (day1/day2/day3). @type {[string, Function]} */
    const [daySelection, setDaySelection] = useState('day1');

    /**
     * Parsed contents of the issuance-date JSON: { username: [substring, ...] }.
     * @type {[Object|null, Function]}
     */
    const [usernameData, setUsernameData] = useState(null);

    /** Forecaster options for the selected date. @type {[Array|null, Function]} */
    const [usernameOptions, setUsernameOptions] = useState(null);

    /** Selected forecaster. @type {[Object|null, Function]} */
    const [selectedUsername, setSelectedUsername] = useState(null);

    /** IRW options for the selected forecaster + day. @type {[Array|null, Function]} */
    const [irwOptions, setIrwOptions] = useState(null);

    /** Selected IRW (carries username/substring/day/begin/end). @type {[Object|null, Function]} */
    const [selectedIrw, setSelectedIrw] = useState(null);

    /** Metadata from the loaded IRW contour file. @type {[Object|null, Function]} */
    const [irwMetadata, setIrwMetadata] = useState(null);

    /** Selection-level error message. @type {[string|null, Function]} */
    const [errMsg, setErrMsg] = useState(null);

    /** Data-load error message. @type {[string|null, Function]} */
    const [dataLoadErrMsg, setDataLoadErrMsg] = useState(null);

    /** Whether data is currently being fetched. @type {[boolean, Function]} */
    const [dataIsFetching, setDataIsFetching] = useState(false);

    const { map } = useMap();

    /**
     * When the issuance date changes, fetch that day's usernames + valid times.
     */
    useEffect(() => {
        if (issuanceDate !== null) {
            fetchUsernamesForDate()
        }
    }, [issuanceDate])

    /**
     * When the forecaster or forecast day changes, recompute the IRW dropdown.
     */
    useEffect(() => {
        if (selectedUsername !== null) {
            refreshIrwOptions(selectedUsername.value, daySelection)
        }
    }, [selectedUsername, daySelection])

    /**
     * Load data from a share link query string, if present.
     */
    useEffect(() => {
        const qs = props.queryStringObj
        if (qs && 'date' in qs && 'user' in qs && 'irw' in qs) {
            props.setLoadFromQueryString(true)
            const parsed = parseSubstring(qs['irw'])
            if (parsed) {
                setDaySelection(parsed.day)
            }
            setIssuanceDate(dayjs(qs['date'], 'YYYYMMDD').toDate())
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
     * Fetch the usernames + valid times JSON for the selected issuance date.
     */
    const fetchUsernamesForDate = () => {
        setDataIsFetching(true)
        const dateStr = dayjs(issuanceDate).format('YYYYMMDD')

        axios.get(`${props.dataURL}Usernames/FFaIR_usernames_and_validtimes_${dateStr}.json`)
            .then((response) => {
                const data = response.data || {}
                setUsernameData(data)
                setUsernameOptions(Object.keys(data).map((u) => createOption(u)))
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
                    setErrMsg('No IRWs issued on ' + dateStr)
                } else {
                    setErrMsg('Error fetching IRWs')
                }
                setUsernameData(null)
                setUsernameOptions(null)
                setDataIsFetching(false)
            })
    }

    /**
     * Recompute the IRW dropdown for a forecaster + forecast day.
     *
     * @param {string} username - Selected forecaster username
     * @param {string} day - Selected forecast day (day1/day2/day3)
     */
    const refreshIrwOptions = (username, day) => {
        const entries = (usernameData && usernameData[username]) || []
        const opts = entries
            .map((s) => makeIrwOption(username, s))
            .filter((o) => o && o.day === day)
            .sort((a, b) => a.begin.localeCompare(b.begin) || a.substring.localeCompare(b.substring))
        setIrwOptions(opts)

        // If loading from a share link, select the requested IRW.
        if (props.loadFromQueryString) {
            const match = opts.find((o) => o.substring === props.queryStringObj['irw'])
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
     * where {key} = "{username}_day{N}_id{N}_{START}_{END}" (the "st"/"et" markers
     * from the older substring form are dropped — see substringToFileKey).
     *
     * @param {string} productID - Layer key from layerConf
     * @param {string} irwKey - "{username}_day{N}_id{N}_{START}_{END}"
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
     * the menu selections in sync — used by the Submit button and prev/next nav.
     *
     * @param {string} username - Forecaster username
     * @param {string} substring - "day{N}_id{N}_{START}_{END}" substring
     */
    const loadIrw = (username, substring) => {
        setDataIsFetching(true)

        const irwKey = `${username}_${substringToFileKey(substring)}`
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
            setSelectedIrw((prev) => (prev && prev.value === substring && prev.username === username)
                ? prev
                : makeIrwOption(username, substring))
        })
    }

    /**
     * Handle form submission to load the selected IRW.
     */
    const handleSubmit = () => {
        if (selectedIrw === null) return
        loadIrw(selectedIrw.username, selectedIrw.substring)
    }

    /**
     * Build the current forecaster + day IRW list (substrings, sorted by valid time).
     *
     * @returns {string[]} Ordered list of substrings
     */
    const currentIrwList = () => {
        if (selectedIrw === null) return []
        return ((usernameData && usernameData[selectedIrw.username]) || [])
            .map((s) => makeIrwOption(selectedIrw.username, s))
            .filter((o) => o && o.day === selectedIrw.day)
            .sort((a, b) => a.begin.localeCompare(b.begin) || a.substring.localeCompare(b.substring))
            .map((o) => o.substring)
    }

    /**
     * Navigate to the previous/next IRW for the current forecaster + forecast day,
     * ordered by valid time.
     *
     * @param {number} step - -1 for previous, +1 for next
     */
    const navigateIrw = (step) => {
        if (selectedIrw === null) return
        const list = currentIrwList()
        const idx = list.indexOf(selectedIrw.substring)
        if (idx === -1) return
        const target = list[idx + step]
        if (!target) return
        loadIrw(selectedIrw.username, target)
    }

    /**
     * Clear the currently displayed IRW (map data + metadata) so the stats panel
     * is hidden. Called whenever the selection context changes away from the
     * loaded IRW (date/forecaster/day), so stale data is never shown — e.g. when
     * flipping to a forecast day that has no IRWs for the forecaster.
     */
    const clearLoadedIrw = () => {
        props.handleMapDataChange(null)
        setIrwMetadata(null)
    }

    /**
     * Handle issuance-date change (resets downstream selections).
     *
     * @param {Date} newDate - Newly selected date
     */
    const handleDateChange = (newDate) => {
        setIssuanceDate(newDate)
        setSelectedUsername(null)
        setSelectedIrw(null)
        setIrwOptions(null)
        clearLoadedIrw()
    }

    /**
     * Handle forecaster change (resets the IRW selection).
     *
     * @param {Object} newValue - Newly selected forecaster option
     */
    const handleUsernameChange = (newValue) => {
        setSelectedUsername(newValue)
        setSelectedIrw(null)
        clearLoadedIrw()
    }

    /**
     * Handle forecast-day toggle change (resets the IRW selection).
     *
     * @param {Object} event - Toggle change event
     * @param {string|null} newDay - Newly selected day, or null if unchanged
     */
    const handleDayChange = (event, newDay) => {
        if (newDay !== null) {
            setDaySelection(newDay)
            setSelectedIrw(null)
            clearLoadedIrw()
        }
    }

    // Determine whether prev/next navigation is available for the current IRW.
    let hasPrev = false
    let hasNext = false
    if (selectedIrw) {
        const list = currentIrwList()
        const idx = list.indexOf(selectedIrw.substring)
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

                {/* Step 1: issuance date */}
                <div className='mt-3 mb-2 ml-2 mr-2'>
                    <DatePicker
                        wrapperClassName='w-full'
                        className='w-full rounded pl-2 pr-2 pt-2 pb-2 placeholder-[#808080]'
                        placeholderText="IRW Issuance Date"
                        selected={issuanceDate}
                        onChange={(date) => handleDateChange(date)}
                        minDate={MIN_DATE}
                        maxDate={dayjs().toDate()}
                    />
                </div>

                {/* Step 2: forecaster */}
                {issuanceDate !== null && usernameOptions !== null ?
                    <div className='mb-2 ml-2 mr-2'>
                        <Select
                            placeholder="User"
                            options={usernameOptions}
                            value={selectedUsername}
                            onChange={handleUsernameChange}
                        />
                    </div>
                :
                    null
                }

                {/* Step 3: forecast day */}
                {issuanceDate !== null && usernameOptions !== null ?
                    <div className='mb-2 ml-2 mr-2 flex justify-center'>
                        <ToggleButtonGroup
                            value={daySelection}
                            exclusive
                            onChange={handleDayChange}
                            size="small"
                            fullWidth
                            sx={{
                                '& .MuiToggleButton-root': { color: 'white', borderColor: 'rgba(255,255,255,0.4)' },
                                '& .MuiToggleButton-root.Mui-selected': { color: 'white', backgroundColor: 'rgba(59,130,246,0.6)' },
                                '& .MuiToggleButton-root.Mui-selected:hover': { backgroundColor: 'rgba(59,130,246,0.7)' },
                            }}
                        >
                            {DAY_OPTIONS.map((d) => (
                                <ToggleButton key={d.value} value={d.value}><b>{d.label}</b></ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </div>
                :
                    null
                }

                {/* Step 4: IRW (by valid time) */}
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
                            <Alert severity="info">No IRWs for this user on the selected day.</Alert>
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
                    <ShareMenu selectedIrw={selectedIrw} issuanceDate={issuanceDate} />
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
 * @param {Object|null} props.selectedIrw - Currently selected IRW (username/substring/...)
 * @param {Function} props.navigateIrw - Function to move to the prev/next IRW
 * @param {boolean} props.hasPrev - Whether a previous IRW exists
 * @param {boolean} props.hasNext - Whether a next IRW exists
 * @returns {JSX.Element} Rendered component
 */
const MetadataDisplay = (props) => {
    const forecaster = props.selectedIrw ? props.selectedIrw.username : ''

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
                    <p className='text-white text-center text-sm pt-1 pb-1'>{'User: ' + forecaster}</p>
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
 * @param {Object|null} props.selectedIrw - Currently selected IRW (username/substring/...)
 * @param {Date|null} props.issuanceDate - Currently selected issuance date
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
        if (props.selectedIrw !== null && props.issuanceDate !== null) {
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
                'date': dayjs(props.issuanceDate).format('YYYYMMDD'),
                'user': props.selectedIrw.username,
                'irw': props.selectedIrw.substring,
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
