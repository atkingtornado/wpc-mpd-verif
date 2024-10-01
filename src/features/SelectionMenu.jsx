import { useState, useEffect } from 'react'

// import moment from 'moment';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
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
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import DatePicker from "react-datepicker";
import Zoom from 'react-medium-image-zoom';

import layerConf, {staticLayerConf} from './layerConf';

import 'react-medium-image-zoom/dist/styles.css';
import "react-datepicker/dist/react-datepicker.css";

dayjs.extend(utc)
dayjs.extend(timezone)

const SelectionMenu = (props) => {

    const [searchByNumber, setSearchByNumber] = useState(true);
    const [yearSelection, setYearSelection] = useState(null);
    const [mpdNumberInput, setMpdNumberInput] = useState('');
    const [mpdNumberValue, setMpdNumberValue] = useState(null);
    const [mpdDate, setMpdDate] = useState(null);
    const [mpdOptions, setMpdOptions] = useState(null);
    const [selectedMpd, setSelectedMpd] = useState(null);
    const [mpdMetadata, setMpdMetadata] = useState(null)
    const [errMsg, setErrMsg] = useState(null);
    const [dataLoadErrMsg, setDataLoadErrMsg] = useState(null);
    const [dataIsFetching, setDataIsFetching] = useState(false);
    // const [loadFromQueryString, setLoadFromQueryString] = useState(false);

    const { map } = useMap();

    // Update date selection menu every time new MPD metadata is loaded 
    // (mainly for when the user is incrementing/decrementing MPDs)
    useEffect(() => {
        if(mpdMetadata !== null){
            let validDate = dayjs(mpdMetadata['valid_date'].split(' ')[0], 'YYYY-MM-DD')
            if(!dayjs(mpdDate).isSame(validDate)) {
                setMpdDate(validDate.toDate())
            }
        }
    }, [mpdMetadata])

    useEffect(() => {
        if(selectedMpd !== null && mpdNumberValue !== null){
            if(mpdNumberValue.value !== selectedMpd.value) {
                if(searchByNumber && mpdOptions !== null) {
                    mpdOptions.forEach((mpdOption) => {
                        if(mpdOption.value === mpdNumberValue.value){
                            setSelectedMpd(mpdNumberValue)
                        }
                    })
                } else {
                    setMpdNumberValue(selectedMpd)
                }
            }
        }

    }, [mpdNumberValue, selectedMpd])

    // Refresh dropdown menu with new MPD options when the date changes
    useEffect(() => {
        if(mpdDate !== null) {
            fetchAvailableMPDs()
        }
    },[mpdDate])

    // Load data from query string, if available
    useEffect(() => {
        if(Object.keys(props.queryStringObj).length > 0 && "date" in props.queryStringObj && "mpd" in props.queryStringObj) {
            props.setLoadFromQueryString(true)
            setMpdDate(dayjs(props.queryStringObj['date']).toDate())
            setYearSelection(createOption(dayjs(props.queryStringObj['date']).year()))
            setMpdNumberValue(createOption(props.queryStringObj['mpd']))
        }
    },[props.queryStringObj])

    useEffect(() => {
        if(props.loadFromQueryString){
            handleSubmit()
        }
    },[selectedMpd])



    const fetchAvailableMPDs = () => {
        setDataIsFetching(true)

        let dateStr = mpdDate.toISOString().substring(0, 10)
        dateStr = dateStr.replaceAll('-','')
        let yrStr = dateStr.substring(0, 4)

        axios.get(props.dataURL + yrStr + '/' + 'MPD_nums_valid_' + dateStr + '.json')
        .then(response => {
            const tmpOptions = response.data['mpd_nums'].map((mpdNum) => {
                return createOption(mpdNum)
            })

            setMpdOptions(tmpOptions)

            // If date has been changed by the user incrementing/decrementing, set the 
            if(selectedMpd !== null && mpdNumberValue !== null){
                if(mpdNumberValue.value !== selectedMpd.value) {
                    if(searchByNumber && response.data['mpd_nums'].includes(mpdNumberValue.value)) {
                        setSelectedMpd(mpdNumberValue)
                    } 
                }
            }

            //If loading from a query string
            if(props.loadFromQueryString) {
                setSelectedMpd({'value':props.queryStringObj['mpd'], 'label':props.queryStringObj['mpd'] })
            }

            setErrMsg(null)
            setDataIsFetching(false)
        })
        .catch(error => {
            console.log(error)
            if(error.response.status === 404) {
                setErrMsg("No MPD data for " + dateStr)
            } else {
                setErrMsg("Error fetching available MPDs")
            }
            setMpdOptions(null)
            setDataIsFetching(false)
        });
    }

    const fetchGeojsonData = async (productID, yrStr, mpdNum) => {
        let jsonFile = ''
        let tmpProductID = productID
        if(productID === 'MPD'){
            jsonFile = 'MPD_contour_' + yrStr + '_' + mpdNum + '.geojson'
            tmpProductID = 'MPD_contour'
        } else {
            if(productID === 'FLW' ||productID === 'FFW' || productID === 'StageIV'){
                jsonFile = productID + '_' + yrStr + '_' + mpdNum + '.geojson'
            } else {
                jsonFile = productID + '_20km_' + yrStr + '_' + mpdNum + '.geojson'
            }
            
        }

        return axios.get(props.dataURL + yrStr + '/' + tmpProductID + '/' + jsonFile)
    }

    const handleSubmit = () => {
        setDataIsFetching(true)

        let yrStr = null
        let mpdNum = null

        if (searchByNumber) {
            yrStr = yearSelection['value']
            mpdNum = mpdNumberValue['value']
        } else {
            let dateStr = mpdDate.toISOString().substring(0, 10)
            dateStr = dateStr.replaceAll('-','')
            yrStr = dateStr.substring(0, 4)

            mpdNum = selectedMpd['value']
        }

        let tmpGeojsonData = {}
        let allErrors = []
        let allPromises = []
        Object.keys(layerConf).forEach((productID) => {
            allPromises.push(fetchGeojsonData(productID, yrStr, mpdNum))
        })

        Promise.allSettled(allPromises).then((results) => {
          results.forEach((result, i) => {
            let productID = Object.keys(layerConf)[i]

            if(result.status === 'fulfilled'){
                tmpGeojsonData[productID] = result.value.data
                if(productID === "MPD"){
                    if('metadata' in result.value.data){
                        setMpdMetadata(result.value.data['metadata'])
                    } else {
                        setMpdMetadata(null)
                    }
                }
            } else {
                allErrors.push(productID)
                if(productID === "MPD") {
                    setMpdMetadata(null)
                }
            }

          })

          props.handleMapDataChange(tmpGeojsonData)
          setDataLoadErrMsg(null)
          setErrMsg(null)
          setDataIsFetching(false)

          if(allErrors.length !== 0) {
            setDataLoadErrMsg('Error loading data for: ' + allErrors.toString())
          } else {
            setDataLoadErrMsg(null)
          }

        });
    }
    
    const genYearsArray = () => {
      const year = new Date().getFullYear();
      const yearsBack = dayjs().diff('2020-01-01', 'years');
      return Array.from({length: yearsBack}, (v, i) => year - yearsBack + i + 1);
    }

    const createOption = (label) => ({
      label,
      value: label,
    });

    const handleKeyDown = (event) => {
        if (!setMpdNumberValue) return;
        if (event.key ==='Enter' || event.key === 'Tab') {
            setMpdNumberValue(createOption(mpdNumberInput))
            event.preventDefault();
        }
    }

    const handleBlur = () => {
        if(mpdNumberInput !== '') {
            setMpdNumberValue(createOption(mpdNumberInput))
            console.log('setting:' + mpdNumberInput)
        }
    }

    const padMpdNum = (num, size) => {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }
    const incrementMpd = (increment) => {
        setDataIsFetching(true)

        let yrStr = null
        let mpdNum = null

        if (searchByNumber) {
            yrStr = yearSelection['value']
            mpdNum = mpdNumberValue['value']
        } else {
            let dateStr = mpdDate.toISOString().substring(0, 10)
            dateStr = dateStr.replaceAll('-','')
            yrStr = dateStr.substring(0, 4)

            mpdNum = selectedMpd['value']
        }

        mpdNum = padMpdNum(Math.abs(parseInt(mpdNum) + increment), 4)

        setYearSelection(createOption(yrStr))
        setMpdNumberValue(createOption(mpdNum))
        setSearchByNumber(true)


        let tmpGeojsonData = {}
        let allErrors = []
        let allPromises = []
        Object.keys(layerConf).forEach((productID) => {
            allPromises.push(fetchGeojsonData(productID, yrStr, mpdNum))
        })

        Promise.allSettled(allPromises).then((results) => {
          results.forEach((result, i) => {
            let productID = Object.keys(layerConf)[i]

            if(result.status === 'fulfilled'){
                tmpGeojsonData[productID] = result.value.data
                if(productID === "MPD"){
                    if('metadata' in result.value.data){
                        setMpdMetadata(result.value.data['metadata'])
                    } else {
                        setMpdMetadata(null)
                    }
                }
            } else {
                if(productID === "MPD") {
                    setMpdMetadata(null)
                }
                allErrors.push(productID)
            }

          })


          props.handleMapDataChange(tmpGeojsonData)
          setDataLoadErrMsg(null)
          setErrMsg(null)
          setDataIsFetching(false)

          if(allErrors.length !== 0) {
            setDataLoadErrMsg('Error loading data for: ' + allErrors.toString())
          } else {
            setDataLoadErrMsg(null)
          }

        });
    }

    const handleDateChange = (newDate) => {
        setMpdDate(newDate)
        setYearSelection(createOption(dayjs(newDate).year()))
    }

    const yearOptions = genYearsArray().map((yr) => ({label:yr, value:yr}))
    const components = {
      DropdownIndicator: null,
    };  

    return (
        <>
            {dataIsFetching ? 
                <div className='fixed flex top-1/2 left-1/2 z-10 transform -translate-y-[-40px] z-20' >
                    <CircularProgress />
                </div>
            :
                null
            }
            <div className='flex relative ml-auto mr-5 mt-5 z-10 flex-col rounded bg-slate-900/60 w-[220px] p-3 shadow-md'>
                <div className='mb-2 text-center'>
                    <p className='text-white text-2xl font-bold'>MPD Verification</p>
                </div>
                <Divider/>

                <div className={searchByNumber ? 'mb-2 mt-2 rounded outline outline-blue-500' : 'mb-2 mt-2'}>
                    <div className='mt-2 mb-2 ml-2 mr-2'>
                        <Select
                            placeholder="MPD Year"
                            options={yearOptions}
                            value={yearSelection}
                            onChange={(val)=>{setYearSelection(val)}}
                            onFocus={() => {setSearchByNumber(true)}}
                         />
                    </div>
                    { yearSelection !== null ?
                        <div className='mb-2 ml-2 mr-2'>
                            <CreatableSelect
                                components={components}
                                inputValue={mpdNumberInput}
                                isClearable
                                menuIsOpen={false}
                                onChange={(newValue) => setMpdNumberValue(newValue)}
                                onInputChange={(newValue) => setMpdNumberInput(newValue)}
                                onBlur={handleBlur}
                                onFocus={() => {setSearchByNumber(true)}}
                                onKeyDown={handleKeyDown}
                                placeholder="MPD Number"
                                value={mpdNumberValue}
                            />
                        </div>
                    :
                        null
                    }
                </div>

                <Divider><p className='text-white'>OR</p></Divider>

                <div className={!searchByNumber ? 'mt-2 rounded outline outline-blue-500' : 'mt-2'}>
                    <div className='mb-2 ml-2 mr-2 mt-2'>
                        {/*<p className='text-white text-md'>MPD Valid Date:</p>*/}
                        <DatePicker 
                            wrapperClassName='w-full'
                            className='w-full rounded pl-2 pr-2 pt-2 pb-2 placeholder-[#808080]'
                            placeholderText="MPD Valid Date"
                            selected={mpdDate} 
                            onChange={(date) => handleDateChange(date)}
                            onFocus={() => {setSearchByNumber(false)}}
                            minDate={dayjs(yearOptions[0].value.toString(), "YYYY").toDate()}
                            maxDate={dayjs().toDate()}
                        />
                    </div>
                    {mpdDate !== null && mpdOptions !== null?
                        <div className='mb-2 ml-2 mr-2'>
                            <Select
                                options={mpdOptions}
                                value={selectedMpd}
                                onChange={(newValue) => setSelectedMpd(newValue)}
                                onFocus={() => {setSearchByNumber(false)}}
                             />
                        </div>
                    :
                        null
                    }
                </div>

                <div className='mt-4 w-full'>
                    <Button 
                        onClick={handleSubmit}
                        disabled={dataIsFetching || (mpdNumberValue === null && searchByNumber === true) || (selectedMpd === null && searchByNumber === false)} 
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
                    <MetadataDisplay dataIsFetching={dataIsFetching} mpdMetadata={mpdMetadata} incrementMpd={incrementMpd}/>
                    <ShareMenu mpdMetadata={mpdMetadata} />
                    <ImageDisplay mpdMetadata={mpdMetadata}/>
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

const ImageDisplay = (props) => {

    return(
        <>
            { props.mpdMetadata !== null ?
                <div className='fixed bottom-5 left-[200px] max-w-[200px] shadow-md z-10'>
                    <Zoom>
                        <img src={'https://www.wpc.ncep.noaa.gov/archives/metwatch/' + dayjs(props.mpdMetadata['valid_date'].split(' ')[0], 'YYYY-MM-DD').year() + '/images/mcd' + props.mpdMetadata['MPD_number'] + '.gif'}/>
                    </Zoom>
                </div>
            :
                null
            }
        </>
    )
}

const MetadataDisplay = (props) => {

    return (
        <div className='fixed flex top-[181px] rounded bg-slate-900/60 p-1 shadow-md left-1/2 transform -translate-x-1/2 z-10'>
            <Tooltip 
                placement="left"
                title="Previous MPD"
            >
                <div className='cursor-pointer self-center text-white h-full'>
                    <Button onClick={()=>{props.incrementMpd(-1)}} disabled={props.dataIsFetching} style={{color: 'white'}}>
                        <ChevronLeftIcon fontSize="large"/>
                    </Button>
                </div>
            </Tooltip>
            { props.mpdMetadata !== null ?
                <div className='h-full'>
                    <p className='text-white text-center text-xl pt-1'><b>{'MPD ' + props.mpdMetadata['MPD_number']}</b></p>
                    <p className='text-white text-center text-sm pb-1'>{'Tag: ' + props.mpdMetadata['TAG'].toUpperCase()}</p>
                    <p className='text-white text-xs'>
                        <span className='underline mr-2 font-bold'>Valid Start:</span> 
                        <span className='float-right'>{props.mpdMetadata['valid_start']}</span> 
                    </p>
                    <p className='text-white text-xs mb-2'>
                        <span className='underline mr-2 font-bold'>Valid End:</span> 
                        <span className='float-right'>{props.mpdMetadata['valid_end']}</span> 
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
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['Max_Rain_Accumulation']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max Stage IV Rain Rate:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['Max_Rain_Rate']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Max Unit Q:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['Max_Unit_Q']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Mean Unit Q:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['Mean_Unit_Q']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Fr Cov:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['FCOV']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>CSI Value:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['CSI']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Interest:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['INTEREST']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>Centroid Distance:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['CENTROID_DIST']).toFixed(3)}</span> 
                                </p>
                                <p className='text-white text-xs'>
                                    <span className='mr-2 font-bold'>GSS:</span> 
                                    <span className='float-right'>{parseFloat(props.mpdMetadata['GSS']).toFixed(3)}</span> 
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
                title="Next MPD"
            >
                <div className='cursor-pointer self-center text-white h-full'>
                    <Button onClick={()=>{props.incrementMpd(1)}} disabled={props.dataIsFetching} style={{color: 'white'}}>
                        <ChevronRightIcon fontSize="large"/>
                    </Button>
                </div>
            </Tooltip>
        </div>
    )
}

const ShareMenu = (props) => {
    const [open, setOpen] = useState(false);
    const [shareURL, setShareURL] = useState(null)
    const [hasCopied, setHasCopied] = useState(false)
    const { map } = useMap();

    // useEffect(() => {
    //     genShareLink()
    // },[props.mpdMetadata])

    const handleClose = () => {
        setOpen(false);
        setHasCopied(false)
    };

    const handleOpen = () => {
        genShareLink()
        setOpen(true)
    }

    const genShareLink = () => {
        if(props.mpdMetadata !== null) {
            let tmpShareURL = window.location.origin + window.location.pathname
            let validDate = dayjs(props.mpdMetadata['valid_date'].split(' ')[0], 'YYYY-MM-DD')
            let activeOverlays = []
            let layerIDs = Object.keys({...staticLayerConf, ...layerConf})

            // Detemine which overlays are visible and add to query string object
            layerIDs.forEach((overlayID) => {
                if (overlayID !== 'MPD' && map.getLayer(overlayID)) {
                    if(map.getLayoutProperty(overlayID, 'visibility') === 'visible'){
                        activeOverlays.push(overlayID)
                    }
                }
            })

            let tmpQueryStringObj = {
                'date': validDate.format('YYYYMMDD'),
                'mpd': props.mpdMetadata['MPD_number'],
                'overlay': activeOverlays
            }
            tmpShareURL += '?' + queryString.stringify(tmpQueryStringObj)

            setShareURL(tmpShareURL)
            // window.history.pushState({path:tmpShareURL},'',tmpShareURL);
        }
    }

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