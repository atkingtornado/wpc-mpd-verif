import { useState, useEffect } from 'react'

import moment from 'moment';
import axios from 'axios';

import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

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
			if(productID === 'FFW'){
				jsonFile = productID + '_' + yrStr + '_' + mpdNum + '.geojson'
			} else {
				jsonFile = productID + '_20km_' + yrStr + '_' + mpdNum + '.geojson'
			}
			
		}
		return (
			axios.get(props.dataURL + yrStr + '/' + productID + '/' + jsonFile)
	        // .then(response => {
	        // 	tmpGeojsonData[productID] = response.data

	        // 	props.handleMapDataChange(tmpGeojsonData)
	        //     setDataLoadErrMsg(null)
	        //     setDataIsFetching(false)
	        // })
	        // .catch(error => {
	        // 	console.log(error)
		    // });
		)
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
		  	} else {
		  		allErrors.push(productID)
		  	}
		  })
		  console.log(tmpGeojsonData)

		  props.handleMapDataChange(tmpGeojsonData)
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

    const components = {
	  DropdownIndicator: null,
	};	


	return (
		<>
			<div className='flex relative ml-auto mr-5 mt-5 z-10 flex-col rounded bg-slate-900/60 w-[220px] p-3 shadow-md'>
				<div className='mb-2 text-center'>
					<p className='text-white text-2xl'>MPD Verification</p>
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

export default SelectionMenu