import { useState, useEffect } from 'react'

import moment from 'moment';
import axios from 'axios';

import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Tooltip from '@mui/material/Tooltip';

import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import DatePicker from "react-datepicker";

import layerConf from './layerConf';

import "react-datepicker/dist/react-datepicker.css";

const SelectionMenu = (props) => {

	const [searchByNumber, setSearchByNumber] = useState(true);

	const [yearOptions, setYearOptions] = useState([]);
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


	useEffect(() => {
		const yearsArr = genYearsArray()
		let tmpYearOptions = yearsArr.map((yr) => {
			return({label:yr, value:yr})
		})
		setYearOptions(tmpYearOptions)
	},[])

	useEffect(() => {
		if(mpdDate !== null) {
			fetchAvailableMPDs()
		}
	},[mpdDate])

	const fetchAvailableMPDs = () => {
		setDataIsFetching(true)

		let dateStr = mpdDate.toISOString().substring(0, 10)
		dateStr = dateStr.replaceAll('-','')
		let yrStr = dateStr.substring(0, 4)

		axios.get(props.dataURL + yrStr + '/' + 'MPD_nums_valid_' + dateStr + '.json')
        .then(response => {

            const tmpOptions = response.data['valid_mpds'].map((mpdNum) => {
            	return createOption(mpdNum)
            })

            setMpdOptions(tmpOptions)

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
		if(productID === 'MPD'){
			jsonFile = 'MPD_contour_' + yrStr + '_' + mpdNum + '.geojson'
		} else {
			if(productID === 'FFW' || productID === 'StageIV'){
				jsonFile = productID + '_' + yrStr + '_' + mpdNum + '.geojson'
			} else {
				jsonFile = productID + '_20km_' + yrStr + '_' + mpdNum + '.geojson'
			}
			
		}

		return axios.get(props.dataURL + yrStr + '/' + productID + '/' + jsonFile)
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
		  	}

		  })


		  props.handleMapDataChange(tmpGeojsonData)
		  setDataLoadErrMsg(null)
		  setErrMsg(null)
		  setDataIsFetching(false)

		  console.log(allErrors.toString())
		  if(allErrors.length !== 0) {
		  	setDataLoadErrMsg('Error loading data for: ' + allErrors.toString())
		  } else {
		  	setDataLoadErrMsg(null)
		  }

		});
	}
	
	const genYearsArray = () => {
	  const year = new Date().getFullYear();
	  const yearsBack = moment().diff('2015-01-01', 'years');
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
		  		allErrors.push(productID)
		  	}

		  })


		  props.handleMapDataChange(tmpGeojsonData)
		  setDataLoadErrMsg(null)
		  setErrMsg(null)
		  setDataIsFetching(false)

		  console.log(allErrors.toString())
		  if(allErrors.length !== 0) {
		  	setDataLoadErrMsg('Error loading data for: ' + allErrors.toString())
		  } else {
		  	setDataLoadErrMsg(null)
		  }

		});
    }

    const components = {
	  DropdownIndicator: null,
	};	

	return (
		<>
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
							onChange={(date) => setMpdDate(date)}
							onFocus={() => {setSearchByNumber(false)}}
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
				<MetadataDisplay dataIsFetching={dataIsFetching} mpdMetadata={mpdMetadata} incrementMpd={incrementMpd}/>
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

const MetadataDisplay = (props) => {

	return (
		<div className='fixed flex top-[133px] rounded bg-slate-900/60 p-2 shadow-md left-1/2 transform -translate-x-1/2 z-10'>
			<Tooltip 
				slotProps={{
			        popper: {
			          modifiers: [
			            {
			              name: 'offset',
			              options: {
			                offset: [0, 20],
			              },
			            },
			          ],
			        },
			    }}
				title="Previous MPD"
	        >
				<div onClick={()=>{props.incrementMpd(-1)}} className='cursor-pointer self-center text-white h-full mr-2'>
					<Button disabled={props.dataIsFetching} style={{color: 'white'}}>
        				<ChevronLeftIcon fontSize="large"/>
        			</Button>
				</div>
			</Tooltip>
			{ props.mpdMetadata !== null ?
				<div className='h-full'>
					<p className='text-white text-center text-lg'><b>{'MPD ' + props.mpdMetadata['MPD_number']}</b></p>
					<p className='text-white text-xs'>
						<span className='underline mr-2'><b>Valid Start:</b></span> 
						<span className='float-right'>{props.mpdMetadata['valid_start']}</span> 
					</p>
					<p className='text-white text-xs'>
						<span className='underline mr-2'><b>Valid End:</b></span> 
						<span className='float-right'>{props.mpdMetadata['valid_end']}</span> 
					</p>
				</div>
			:
				null
			}

			<Tooltip 
				slotProps={{
			        popper: {
			          modifiers: [
			            {
			              name: 'offset',
			              options: {
			                offset: [0, 20],
			              },
			            },
			          ],
			        },
			    }}
			    title="Next MPD"
			>
				<div onClick={()=>{props.incrementMpd(1)}} className='cursor-pointer self-center text-white h-full ml-2'>
					<Button disabled={props.dataIsFetching} style={{color: 'white'}}>
						<ChevronRightIcon fontSize="large"/>
					</Button>
				</div>
			</Tooltip>
		</div>
	)
}

export default SelectionMenu