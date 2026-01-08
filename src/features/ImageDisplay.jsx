/**
 * @fileoverview Image display component for MPD Verification tool (for monthly/long-term verif images) 
 * This file provides the UI for selecting and loading MPD verification images
 */

import { useState, useEffect, useRef } from 'react'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Select from 'react-select';
import Zoom from "react-medium-image-zoom"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'

import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';


import "react-medium-image-zoom/dist/styles.css"

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Generate an array of years from 2020 to current year
 * 
 * @returns {number[]} Array of years
 */
const genYearsArray = () => {
  const year = new Date().getFullYear();
  const yearsBack = dayjs().diff('2017-01-01', 'years');
  return Array.from({length: yearsBack}, (v, i) => year - yearsBack + i + 1);
}

const yearArray = genYearsArray()
const yearOptions = yearArray.map((yr) => ({label:yr, value:yr}))

const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const monthOptions = monthArray.map((mon) => ({label:mon, value:mon}))

const seasonArray = ["DJF", "MAM", "JJA", "SON"]
const seasonOptions = seasonArray.map((szn) => ({label:szn, value:szn}))

const monthlyPlotOptions = [
	{label: "Heat Map - All MPDs", value: "heat_map_all_MPD"},
	{label: "Heat Map - False Alarm MPDs", value: "heat_map_no_WA_OR_FAR_MPD"},
	{label: "MPD/UFVS Centroid and Directional Displacement", value: "rose_cen_disp_mpd"},
	{label: "Skill Scores", value: "barchart_no_WA_OR_20km_skill_scores"},
	{label: "CSI - All MPDs (YTD)", value: "barchart_20km_no_WA_OR_CSI_ALL_YTD"},
	{label: "Bias - All MPDs (YTD)", value: "barchart_20km_no_WA_OR_FRB_ALL_YTD"},
	{label: "Frac. Cov. - All MPDs (YTD)", value: "barchart_20km_no_WA_OR_FRC_ALL_YTD"},
	{label: "False Alarm MPDs (YTD)", value: "barchart_20km_no_WA_OR_FAR_ALL_YTD"},
	{label: "Percentage of MPDs with No Obs (YTD)", value: "barchart_20km_no_WA_OR_FAR_PCT_ALL_YTD"},
	{label: "CSI - All MPDs (All Years)", value: "barchart_20km_no_WA_OR_CSI_ALL_YEARS"},
	{label: "Bias - All MPDs (All Years)", value: "barchart_20km_no_WA_OR_FRB_ALL_YEARS"},
	{label: "Frac. Cov. - All MPDs (All Years)", value: "barchart_20km_no_WA_OR_FRC_ALL_YEARS"},
	{label: "False Alarm MPDs (All Years)", value: "barchart_20km_no_WA_OR_FAR_ALL_YEARS"},
	{label: "Percentage of MPDs with No Obs (All Years)", value: "barchart_20km_no_WA_OR_FAR_PCT_ALL_YEARS"},
]

const seasonalPlotOptions = [
	{label: "Heat Map - All MPDs", value: "heat_map_all_MPD"},
	{label: "Skill Scores", value: "barchart_20km_skill_scores"},
	{label: "MPD/UFVS Centroid and Directional Displacement", value: "rose_cen_disp_mpd"},
]

const annualPlotOptions = [
	{label: "Skill Scores", value: "barchart_no_WA_OR_skill_scores_year"},
	{label: "Heat Map - All MPDs", value: "heat_map_all_MPD_year"},
	{label: "Heat Map - False Alarm MPDs", value: "heat_map_FAR_MPDs_year"},
	{label: "Heat Map - DJF MPDs", value: "heat_map_DJF_MPD"},
	{label: "Heat Map - MAM MPDs", value: "heat_map_MAM_MPD"},
	{label: "Heat Map - JJA MPDs", value: "heat_map_JJA_MPD"},
	{label: "Heat Map - SON MPDs", value: "heat_map_SON_MPD"},
	{label: "MPD/UFVS Centroid and Directional Displacement", value: "rose_cen_disp_mpd_year"},
	{label: "MPD/UFVS Centroid and Directional Displacement (DJF)", value: "rose_cen_disp_mpd_year_DJF"},
	{label: "MPD/UFVS Centroid and Directional Displacement (MAM)", value: "rose_cen_disp_mpd_year_MAM"},
	{label: "MPD/UFVS Centroid and Directional Displacement (JJA)", value: "rose_cen_disp_mpd_year_JJA"},
	{label: "MPD/UFVS Centroid and Directional Displacement (SON)", value: "rose_cen_disp_mpd_year_SON"},
	{label: "MPD/UFVS Centroid and Directional Displacement (WC)", value: "rose_cen_disp_mpd_year_WC"},
	{label: "MPD/UFVS Centroid and Directional Displacement (SW)", value: "rose_cen_disp_mpd_year_SW"},
	{label: "MPD/UFVS Centroid and Directional Displacement (NP)", value: "rose_cen_disp_mpd_year_NP"},
	{label: "MPD/UFVS Centroid and Directional Displacement (SP)", value: "rose_cen_disp_mpd_year_SP"},
	{label: "MPD/UFVS Centroid and Directional Displacement (SE)", value: "rose_cen_disp_mpd_year_SE"},
	{label: "MPD/UFVS Centroid and Directional Displacement (NE)", value: "rose_cen_disp_mpd_year_NE"},
]

const multiyearPlotOptions = [
	{label: "Heat Map - All MPDs", value: "heat_map_all_MPD_GnBu_2018"},
	{label: "CSI", value: "barchart_no_WA_OR_CSI_MPD_yrs_2018"},
	{label: "Frequency Bias", value: "barchart_no_WA_OR_BIAS_MPD_yrs_2018"},
	{label: "Frac. Cov.", value: "barchart_no_WA_OR_FR_COV_MPD_yrs_2018"},
	{label: "Number of MPDs", value: "barchart_no_WA_OR_NUM_MPD_yrs_2018"},
	{label: "False Alarm MPDs", value: "barchart_no_WA_OR_FAR_CT_MPD_yrs_2018"},
	{label: "False Alarm %", value: "barchart_no_WA_OR_FAR_PERCENT_MPD_yrs_2018"},
	{label: "CSI (By Region)", value: "barchart_no_WA_OR_CSI_MPD_REGION_yrs_2018"},
	{label: "Frequency Bias (By Region)", value: "barchart_no_WA_OR_BIAS_MPD_REGION_yrs_2018"},
	{label: "Frac. Cov. (By Region)", value: "barchart_no_WA_OR_FR_COV_MPD_REGION_yrs_2018"},
	{label: "Number of MPDs (By Region)", value: "barchart_no_WA_OR_NUM_MPD_REGION_yrs_2018"},
	{label: "False Alarm MPDs (By Region)", value: "barchart_no_WA_OR_FAR_CT_MPD_REGION_yrs_2018"},
	{label: "False Alarm % (By Region)", value: "barchart_no_WA_OR_FAR_PERCENT_MPD_REGION_yrs_2018"},
	{label: "CSI (By Season)", value: "barchart_no_WA_OR_CSI_MPD_SEASON_yrs_2018"},
	{label: "Frequency Bias (By Season)", value: "barchart_no_WA_OR_FR_BIAS_MPD_SEASON_yrs_2018"},
	{label: "Frac. Cov. (By Season)", value: "barchart_no_WA_OR_FR_COV_MPD_SEASON_yrs_2018"},
	{label: "Number of MPDs (By Season)", value: "barchart_no_WA_OR_NUM_MPD_SEASON_yrs_2018"},
	{label: "False Alarm MPDs (By Season)", value: "barchart_no_WA_OR_FAR_CT_MPD_SEASON_yrs_2018"},
	{label: "False Alarm % (By Season)", value: "barchart_no_WA_OR_FAR_PERCENT_MPD_SEASON_yrs_2018"},
	{label: "CSI (By Event Type)", value: "barchart_20km_CSI_MPD_EVENT_yrs_2018"},
	{label: "Frequency Bias (By Event Type)", value: "barchart_20km_BIAS_MPD_EVENT_yrs_2018"},
	{label: "Frac. Cov. (By Event Type)", value: "barchart_20km_FCOV_MPD_EVENT_yrs_2018"},
	{label: "False Alarm MPDs (By Event Type)", value: "barchart_20km_FAR_num_MPD_EVENT_yrs_2018"},
	{label: "False Alarm % (By Event Type)", value: "barchart_20km_FAR_PCT_MPD_EVENT_yrs_2018"},
	{label: "MPD Size", value: "line_plot_mpd_size_2018"},
	{label: "MPD Size (By region)", value: "line_plot_mpd_size_region_2018"},
	{label: "MPD Size (By season)", value: "line_plot_mpd_size_season_2018"},
]

/**
 * Image display component
 * Allows for selection/viewing of MPD verif images
 * 
 * @component
 * @returns {JSX.Element} Rendered component
 */
const ImageDisplay = (props) => {

	/**
	* State for verification image time period
	* @type {["monthly"|"seasonal"|"annual"|"multiyear", Function]}
	*/
	const [timePeriod, setTimePeriod] = useState('monthly');

  /**
   * State for selected year in the year dropdown
   * @type {[[Object], Function]}
   */
  const [yearSelection, setYearSelection] = useState(yearOptions[yearOptions.length-1]);

  /**
   * State for selected month in the month dropdown
   * @type {[[Object], Function]}
   */
  const [monthSelection, setMonthSelection] = useState(monthOptions[0]);

  /**
   * State for selected season in the season dropdown
   * @type {[[Object], Function]}
   */
  const [seasonSelection, setSeasonSelection] = useState(seasonOptions[0]);

  /**
   * State for plot name options
   * @type {[[Object]|null, Function]}
   */
  const [plotOptions, setPlotOptions] = useState(null);

  /**
   * State for selected plot name
   * @type {[[Object], Function]}
   */
  const [plotSelection, setPlotSelection] = useState(monthlyPlotOptions[0]);

  /**
   * State for currently visible image URL
   * @type {[string, Function]}
   */
  const [imgURL, setImgURL] = useState(monthlyPlotOptions[0]);

  /**
   * State for error message text
   * @type {[string|null, Function]}
  */
  const [errMsg, setErrMsg] = useState(null)

  /**
   * Reference to track if year was selected by user or progamatically changed
   * @type {Object}
  */
  const userSelectedYear = useRef(yearOptions[yearOptions.length-1])

 /**
 * Effect to update plot options when time period selection changes
 */
  useEffect(() => {
  	let currYear = new Date().getFullYear()

  	if(timePeriod === "monthly") {
  		setPlotOptions(monthlyPlotOptions)
  		setPlotSelection(monthlyPlotOptions[0])
  		if (yearSelection.value !== userSelectedYear.current.value){
  			console.log(userSelectedYear.current)
  			setYearSelection(userSelectedYear.current)
  		}
  	} else if(timePeriod === "seasonal") {
  		setPlotOptions(seasonalPlotOptions)
  		setPlotSelection(seasonalPlotOptions[0])
  		if (yearSelection.value !== userSelectedYear.current.value){
  			console.log(userSelectedYear.current)
  			setYearSelection(userSelectedYear.current)
  		}
  	} else if(timePeriod === "annual") {
  		setPlotOptions(annualPlotOptions)
  		setPlotSelection(annualPlotOptions[0])
  		if (yearSelection.value === currYear) {
  			setYearSelection(yearOptions[yearOptions.length-2])
  		}
  	} else if(timePeriod === "multiyear") {
  		setPlotOptions(multiyearPlotOptions)
  		setPlotSelection(multiyearPlotOptions[0])
  		if (yearSelection.value === currYear) {
  			setYearSelection(yearOptions[yearOptions.length-2])
  		}
  	}	
  	
  },[timePeriod])

	/**
	* Effect to update plot URL when selections change
	*/
	useEffect(() => {
		const currURL = genPlotURL()
		setErrMsg(null)
		setImgURL(currURL)
		console.log(currURL)
	},[timePeriod, yearSelection, monthSelection, seasonSelection, plotSelection])

	/**
	* Function to generate image URL based on menu selections
	*/
	const baseURL = "https://www.wpc.ncep.noaa.gov/verification/mpd_verif/Images"
	const genPlotURL = () => {
		let tmpURL = ""

		if (timePeriod === "monthly") {
			// the ALL_YEARS plots do not have the year (YYYY) string in the image name 
			if (plotSelection.value.includes("ALL_YEARS")){
				tmpURL = `${baseURL}/Monthly/${yearSelection.value}_${monthSelection.value}/${plotSelection.value}_${monthSelection.value}.png`
			} else {
				tmpURL = `${baseURL}/Monthly/${yearSelection.value}_${monthSelection.value}/${plotSelection.value}_${yearSelection.value}_${monthSelection.value}.png`
			}
		} else if (timePeriod === "seasonal") {
			tmpURL = `${baseURL}/Seasonal/${yearSelection.value}_season_${seasonSelection.value}/${plotSelection.value}_${yearSelection.value}_season_${seasonSelection.value}.png`
		} else if (timePeriod === "annual") {
			tmpURL = `${baseURL}/All_Yrs/${plotSelection.value}_${yearSelection.value}.png`
		} else if (timePeriod === "multiyear") {
			if (plotSelection.value.includes("EVENT")){
				tmpURL = `${baseURL}/Event/All_Yrs/${plotSelection.value}_${yearSelection.value}.png`
			} else if (plotSelection.value.includes("mpd_size")) {
				tmpURL = `${baseURL}/All_Yrs/${plotSelection.value}-${yearSelection.value}.png`
			} else {
				tmpURL = `${baseURL}/All_Yrs/${plotSelection.value}_${yearSelection.value}.png`
			}
		}

		// Some plot names change after Oct 2024 due to inclusion of WA & OR in verification process
		const isAfterOct2024 = yearSelection.value > 2024 || (yearSelection.value === 2024 && (monthSelection.value === "Oct" || monthSelection.value === "Nov" || monthSelection.value === "Dec"))
		if (isAfterOct2024) {
			tmpURL = tmpURL.replace("_no_WA_OR", "");
		}

		return tmpURL
	}

	/**
 	* Handles time period change
 	*/
	const handleTimePeriodChange = (event, newTimePeriod) => {
		if (newTimePeriod !== null) {
			setTimePeriod(newTimePeriod);
		}
	};

	/**
 	* Handles year change
 	*/
	const handleYearChange = (newYear) => {
		setYearSelection(newYear)
		userSelectedYear.current = newYear
	}

  /**
 	* Handles successful image load
 	*/
  const onImageLoad = () => {
    setErrMsg(null)
  }

  /**
  * Handles image load errors
  */
  const onImageError = () => {
    setErrMsg("No plot available for selected date")
  }

	return (
		<div className="flex justify-center mt-4 flex-col items-center">
			<div className="flex flex-row justify-center items-center mb-4">
	      <h2 className="text-xl md:text-2xl text-center font-bold">Historical MPD Verification</h2>
	      <Tooltip title="About this product">
	        <FontAwesomeIcon className="text-[#03457f] rounded-full ml-[10px] text-[24px] cursor-pointer animate-[anim-glow_1.8s_ease_infinite]" icon={faCircleQuestion} onClick={()=>{props.setHelpMenuOpen(true)}} />
	      </Tooltip>
	    </div>
			<div className="mb-4">
				<Button onClick={()=>{props.setDisplayType("interactive")}} variant="contained" size="small">Individual MPD Statistics</Button>
			</div>
			<ToggleButtonGroup
		      value={timePeriod}
		      exclusive
		      onChange={handleTimePeriodChange}
		      aria-label="verif time period"
		      size="small"
		    >
		      <ToggleButton value="monthly" aria-label="monthly">
		        <b>Monthly</b>
		      </ToggleButton>
		      <ToggleButton value="seasonal" aria-label="seasonal">
		        <b>Seasonal</b>
		      </ToggleButton>
		      <ToggleButton value="annual" aria-label="annual">
		        <b>Annual</b>
		      </ToggleButton>
		      <ToggleButton value="multiyear" aria-label="multiyear">
		        <b>Multi-Year</b>
		      </ToggleButton>
		    </ToggleButtonGroup>
		    <div className="mt-2 flex gap-2 flex-row">

	    		<Select
            placeholder="Year"
            options={yearOptions}
            value={yearSelection}
            onChange={handleYearChange}
          />
		    	
		    	{ timePeriod === "monthly" &&
		    		<Select
              placeholder="Month"
              options={monthOptions}
              value={monthSelection}
              onChange={(val)=>{setMonthSelection(val)}}
            />
		      }

	       	{ timePeriod === "seasonal" &&
		    		<Select
              placeholder="Season"
              options={seasonOptions}
              value={seasonSelection}
              onChange={(val)=>{setSeasonSelection(val)}}
            />
	        }

	    		<Select
            placeholder="Plot"
            options={plotOptions}
            value={plotSelection}
            onChange={(val)=>{setPlotSelection(val)}}
          />

		    </div>
		    {/* Image display container */}
	      <div className={"max-w-[1800px] flex flex-col mt-4"}>
	        {errMsg !== null ? (
	          // Error message display
	          <>
	            <p className={"text-red-500 font-bold text-[22px]"}>{errMsg}</p>
	            <FontAwesomeIcon className={"text-[72px]"} icon={faImage} />
	          </>
	        ) : (
	          // Image with zoom capability
	          <Zoom>
	            <img
	              className={"block max-w-full w-auto h-auto min-h-[200px]"}
	              src={imgURL || "/placeholder.svg"}
	              onLoad={onImageLoad}
	              onError={onImageError}
	              alt="MPD verification plot"
	            />
	          </Zoom>
	        )}
	      </div>
		</div>
	)
}


export default ImageDisplay 