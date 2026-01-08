import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AboutModal = (props) => {
    return(
      <Dialog 
        style={{zIndex:9999}} 
        onClose={props.onClose} 
        open={props.open}
        scroll={"paper"}
      >
      {props.displayType === "interactive" ?
        <>
          <DialogTitle variant="h5"><b>About the MPD Verification Page</b></DialogTitle>
          <DialogContent dividers={true}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="mainpanel1-content"
                id="mainpanel1-header"
              >
                <Typography variant="h6"><b>Product Descriptions</b></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>MPD Verification Plot Layers</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ul className="list-disc pl-5">
                      {/* USGS information */}
                      <li>
                        <b>USGS</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Flood observations from the U.S. Geological Survey stream gauges.
                        </li>
                      </ul>

                      {/* LSR information */}
                      <li>
                        <b>LSR(s)</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Local Storm Reports of "Flood" or "Flash Flood" as recorded by the WFOs.
                        </li>
                      </ul>

                      {/* mPING information */}
                      <li>
                        <b>mPING</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Public weather reports submitted via the NSSL mPING application{" "}
                        </li>
                      </ul>

                      {/* ST4 > ARI information */}
                      <li><b>ST4 &gt; ARI</b></li>
                      <ul className="list-disc pl-10">
                        <li><b>Description:</b> Points where Stage IV rainfall exceeds the 5-year Average Recurrence Interval value.</li>
                        <li><b>Relevant Publications:</b></li>
                        <ul>
                          <li>Perica, S., and Coauthors, 2013: Precipitation-frequency atlas of the United States. NOAA Atlas.</li>
                        </ul>
                      </ul>

                      {/* ST4 > FFG information */}
                      <li>
                        <b>ST4 &gt; FFG</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Points where Stage IV rainfall exceeds the 1-, 3-, and 6-hour Flash Flood
                          Guidance value.
                        </li>
                        <li>
                          <b>Relevant Publications:</b>
                        </li>
                        <ul>
                          <li>
                            Barthold, F. E., T. E. Workoff, B. A. Cosgrove, J. J. Gourley, D. R. Novak, and K. M. Mahoney,
                            2015: "Improving flash flood forecasts: The HMT-WPC Flash Flood and Intense Rainfall Experiment.
                            Bulletin of the American Meteorological Society, 96 (11), 1859–1866,{" "}
                            <a href="https://doi.org/10.1175/BAMS-D-14-00201.1">
                              https://doi.org/10.1175/BAMS-D-14-00201.1.
                            </a>
                          </li>
                          <li>
                            Schmidt, J. A., A. J. Anderson, and J. H. Paul, 2007: Spatially variable, physically-derived
                            flash flood guidance. 21st Conference on Hydrology, San Antonio, TX, Amer. Meteor. Soc., 6B.2,{" "}
                            <a href="https://ams.confex.com/ams/pdfpapers/120022.pdf">
                              https://ams.confex.com/ams/pdfpapers/120022.pdf
                            </a>
                          </li>
                        </ul>
                      </ul>

                      {/* MPD information */}
                      <li>
                        <b>MPD</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Area determined by the MetWatch forecasters to pose an immediate risk for flash flooding in the next 0-6 hours (with the exception of Atmospheric River-related MPDs, which can be valid for up to 12 hours).
                        </li>
                      </ul>

                      {/* Stage IV information */}
                      <li>
                        <b>Stage IV</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Stage IV accumulated hourly rainfall throughout the valid time of the MPD.
                        </li>
                      </ul>

                      {/* FLW information */}
                      <li>
                        <b>FLW</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Flood warnings issued during the valid time of the MPD.
                        </li>
                      </ul>

                      {/* FFW information */}
                      <li>
                        <b>FFW</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Flash flood warnings issued during the valid time of the MPD.
                        </li>
                      </ul>

                    </ul>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>MPD Info & Verification Statistics</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <p>* NOTE: The statistics below will only populate at the end of the month when the full verification runs for the previous month’s MPDs. Until then, they will display “NaN”.</p>
                    <br/>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>MPD XXXX:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> MPD identifier. The numbers begin at 0001 each year.
                        </li>
                      </ul>

                      <li>
                        <b>Tag:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Forecasters give each MPD a tag to tell whether they believe flash flooding is “POSSIBLE”, “LIKELY”, “UNLIKELY”, or if just “HEAVY RAIN” is expected. Note that the “HEAVY RAIN” tag is mostly used for AR-related MPDs.
                        </li>
                      </ul>

                      <li>
                        <b>Valid Start:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Time at which the MPD becomes valid.
                        </li>
                      </ul>

                      <li>
                        <b>Valid End:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Time at which the MPD and flash flood concern end, unless a subsequent MPD is issued.
                        </li>
                      </ul>

                      <li>
                        <b>Max Stage IV Accumulated Rainfall:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Maximum rainfall accumulated within the MPD area throughout the valid time of the MPD.
                        </li>
                      </ul>

                      <li>
                        <b>Max Unit Q:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Maximum unit streamflow (Unit Q) value within the MPD area & throughout the MPD valid time.
                        </li>
                        <li><b>Relevant Publications:</b></li>
                        <ul>
                          <li>Gerard, A., S. M. Martinaitis, J. J. Gourley, K. W. Howard, and J. Zhang, 2021: An Overview of the Performance and Operational Applications of the MRMS and FLASH Systems in Recent Significant Urban Flash Flood Events. Bull. Amer. Meteor. Soc., 102, E2165–E2176, <a href="https://doi.org/10.1175/BAMS-D-19-0273.1">https://doi.org/10.1175/BAMS-D-19-0273.1.</a></li>
                        </ul>
                      </ul>

                      <li>
                        <b>Mean Unit Q:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Mean unit streamflow (Unit Q) value within the MPD area & throughout the MPD valid time.
                        </li>
                      </ul>

                      <li>
                        <b>Fr Cov:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Fractional coverage of the observations within the MPD. Calculate from contingency table statistics.
                        </li>
                      </ul>

                      <li>
                        <b>CSI Value:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Critical Success Index for the observations. Calculated from contingency table statistics.
                        </li>
                      </ul>

                      <li>
                        <b>Interest:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Interest area between the observation object (all UFVS components together) and the MPD, as output from MET MODE. (<a href="https://dtcenter.org/sites/default/files/community-code/met/docs/user-guide/MET_Users_Guide_v9.0.1.pdf">https://dtcenter.org/sites/default/files/community-code/met/docs/user-guide/MET_Users_Guide_v9.0.1.pdf</a>)
                        </li>
                      </ul>

                      <li>
                        <b>Centroid Distance:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Distance between the observation object (all UFVS components together) and the MPD, as output from MET MODE.
                        </li>
                      </ul>

                      <li>
                        <b>GSS:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Gilbert Skill Score for the observation object (all UFVS components together) and the MPD, as output from MET MODE.
                        </li>
                      </ul>

                    </ul>
                  </AccordionDetails>
                </Accordion>


                 <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>Verification Process</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ol className="list-decimal pl-5">
                      <li>Gather MPD information (location, valid times, tag given)</li>
                      <li>Gather UFVS observations (see Mike’s papers or above descriptions for details)</li>
                      <ul className="list-disc pl-10">
                        <li>The UFVS consists of 5 components: Local Storm Reports (LSRs) of FLOOD and FLASH FLOOD, United States Geological Survey (USGS) stream gauge reports of flood stage, and points where Stage IV rainfall exceeds the 1-, 3-, or 6-hour duration 5-year Average Recurrence Interval (ARI) or Flash Flood Guidance (FFG).</li>
                        <li>All of these components are expanded to a 20 km radius circle to account for uncertainty in the location of the flood. The 20 km radius was chosen based on sensitivity analysis.</li>
                        <li>The components are combined and treated as one large object for the verification of the MPD.</li>
                      </ul>
                      <li>Object-based verification is performed using MET MODE.</li>
                      <li>The contingency table statistics output from MODE are used to calculate the basic skill scores for the MPDs.</li>
                      <li>Additional analysis is done by calculating the MPD statistics for various subsets of MPDs. These subsets include regions of the CONUS, seasons (3-month seasons), and event type based on the keywords used in the text discussion of the MPD.</li>
                    </ol>
                  </AccordionDetails>
                </Accordion>


                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>Relevant Publications</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ul className="list-disc pl-5">
                      <li>
                        Bower, E., M. J. Erickson, J. A. Nelson, M. Klein, and A. Orrison, 2024: Objective Verification of the Weather Prediction Center’s Mesoscale Precipitation Discussions. Wea. Forecasting, 39, 915–924, <a href="https://doi.org/10.1175/WAF-D-23-0199.1">https://doi.org/10.1175/WAF-D-23-0199.1</a>.
                      </li>
                      <li>
                        <a href="https://journals.ametsoc.org/view/journals/bams/104/3/BAMS-D-21-0281.1.xml">https://journals.ametsoc.org/view/journals/bams/104/3/BAMS-D-21-0281.1.xml</a>
                      </li>
                      <li>
                        <a href="https://journals.ametsoc.org/view/journals/wefo/36/1/WAF-D-20-0020.1.xml">https://journals.ametsoc.org/view/journals/wefo/36/1/WAF-D-20-0020.1.xml</a>
                      </li>
                    </ul>
                  </AccordionDetails>
                </Accordion>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="mainpanel2-content"
                id="mainpanel2-header"
              >
                <Typography variant="h6"><b>Webpage Help</b></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ul className="list-disc pl-5">
                  <li>
                    To view an MPD, either choose the valid date of the MPD in the box on the right, or choose the year in which the MPD was issued followed by typing in the 4-digit identifying number. Press “Submit”.
                  </li>
                  <li>
                    Automatically, the MPD outline will show up on the map. To add layers to the map, click on the “eye” icon next to the name of the layer. To scroll between MPDs, click the arrows on either side of the gray box containing the MPD information. This will bring you to either the previous (left) or next (right) MPD.
                  </li>
                  <li>
                    Clicking the option for “Historical Statistics” leads the user to an interface for viewing the monthly, seasonal, and annual MPD performance statistics.
                  </li>
                </ul>
              </AccordionDetails>
            </Accordion>
          </DialogContent>
        </>
        :
        <>
          <DialogTitle variant="h5"><b>About the Historical MPD Verification Page</b></DialogTitle>
          <DialogContent dividers={true}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="mainpanel1-content"
                id="mainpanel1-header"
              >
                <Typography variant="h6"><b>Plot Descriptions</b></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>Monthly</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <p>* NOTE: All false alarm heat maps and skill score charts, including the individual charts for CSI, Fractional Coverage, Frequency Bias, and False Alarms, exclude the MPDs in Washington and Oregon from January 2018 through September 2024. From October 2024 on, the statistics include all MPDs. The WA/OR MPDs were neglected from the beginning of the archive due to a lack of UFVS proxies in those states, i.e. there is no Atlas14 coverage in WA or OR, and FFG only covered the coastlines starting in late September 2024</p>
                    <br/>
                    <ul className="list-disc pl-5">
                      <li>
                        <b>Heat map (All MPDs):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Graphic depicting the locations and shapes of all MPDs issued in the selected month.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Heat map (False Alarm MPDs):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Graphic depicting the locations and shapes of the MPDs issued in the selected month that did not correspond to any UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>MPD/UFVS Centroid Displacement:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Rose plot showing the displacement of the centroid of the UFVS observation object in relation to the MPD centroid. Direction is shown, as well as the color indicating the distance.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Skill Scores:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> A summary chart showing the critical success index (CSI), fractional coverage (FR COV), and frequency bias (BIAS) for all MPDs in the selected month as one value. The skill scores are computed by totaling all points within all of the MPDs that are hits (also occupied by a UFVS observation) and false alarms (MPD was valid, but there was no UFVS observation at that point) as well as finding points within 120 km of the MPD but outside the valid MPD area where UFVS observations were recorded (misses). The skill scores are then calculated using all points together. This allows small and large MPDs to be weighted equally.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>CSI YTD:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> CSI for each month of the selected year.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>BIAS YTD:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Frequency bias for each month of the selected year.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>FR COV YTD:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Fractional coverage for each month of the selected year.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>FAR Count YTD:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Number of false alarm MPDs for each month of the selected year.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>FAR Percentage YTD:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Percentage of MPDs that are false alarms for each month of the selected year.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>CSI All Years:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> CSI for the selected month in each year of record (2018 through the present). For example, this plot will allow you to compare how all of the months of January scored over the years.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>BIAS All Years:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for frequency bias.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>FR COV All Years:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for fractional coverage.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>FAR Count All Years:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the number of false alarm MPDs.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>FAR Percentage All Years:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the percentage of MPDs that are false alarms.
                        </li>
                      </ul>
                    </ul>

                  </AccordionDetails>
                </Accordion>

                 <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>Seasonal</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <p>Statistics are also computed for the meteorological seasons of each year. “Winter” is comprised of December, January, and February, with December being from the prior year. “Spring” is March, April, and May; “Summer” is June, July, and August; and “Autumn/Fall” is September, October, and November. Statistics are computed the same as in the monthly verification, where all points from all MPDs are considered when calculating the skill scores. Again, this allows for MPDs to all carry the same weight, regardless of size, shape, or location.</p>
                    <br/>
                    <ul className="list-disc pl-5">
                      <li>
                        <b>Heat map:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Locations and shapes of all MPDs issued in the selected season.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>MPD/UFVS Centroid Displacement:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Rose plot showing the displacement of the centroid of the UFVS observation object in relation to the MPD centroid for all MPDs in the selected season. Direction is shown, as well as the color indicating the distance.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Skill Scores:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> A summary chart showing the critical success index (CSI), fractional coverage (FR COV), and frequency bias (BIAS) for all MPDs in the selected season as one value.
                        </li>
                      </ul>
                    </ul>

                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>Annual</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <p>At the end of each year, statistics are computed for the entire year’s MPDs. Statistics are computed the same as in the monthly verification, where all points from all MPDs are considered when calculating the skill scores. Again, this allows for MPDs to all carry the same weight, regardless of size, shape, or location.</p>
                    <br/>
                    <ul className="list-disc pl-5">
                      <li>
                        <b>Heat map (All MPDs):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Locations and shapes of all MPDs issued in the selected year.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Heat map (False Alarm MPDs):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> graphic depicting the locations and shapes of the MPDs issued in the selected year that did not correspond to any UFVS observations
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Skill Scores:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> A summary chart showing the critical success index (CSI), fractional coverage (FR COV), and frequency bias (BIAS) for all MPDs in the selected year as one value.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Rose plot (All MPDs):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Directional displacements of the UFVS centroids in relation to the MPD centroids. Calculated for all MPDs in the selected year.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Rose plot (WC):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, but only calculated for West Coast region MPDs. See the region breakdown below.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Rose plot (SW):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, but only calculated for Southwest region MPDs. See the region breakdown below.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Rose plot (SP):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, but only calculated for Southern Plains region MPDs. See the region breakdown below.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Rose plot (NP):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, but only calculated for Northern Plains region MPDs. See the region breakdown below.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Rose plot (SE):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, but only calculated for Southeast region MPDs. See the region breakdown below.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Rose plot (NE):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, but only calculated for Northeast region MPDs. See the region breakdown below.
                        </li>
                      </ul>
                    </ul>

                  </AccordionDetails>
                </Accordion>

                 <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography><b>Multi-Year</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <p>Multi-year plots are created to allow for the comparison of skill across the years of record (2018 - present).</p>
                    <br/>
                    <ul className="list-disc pl-5">
                      <li>
                        <b>Heat map - All MPDs:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Locations and shapes of all MPDs issued from 2018 - present.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>CSI:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> CSI for all MPDs in each year of record (2018 - present).
                        </li>
                      </ul>
                    </ul>

                     <ul className="list-disc pl-5">
                      <li>
                        <b>Frequency Bias:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for frequency bias.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Frac. Cov.:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for fractional coverage.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Number of MPDs:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for number of MPDs.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm MPDs:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the number of MPDs without corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm %:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the percentage of MPDs that did have any corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>CSI (By Region):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for CSI, with each year's statistics being divided up by region of the country
                          in which the MPD was issued. See below for more information about the regions of the country.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Frequency Bias (By Region):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for frequency bias.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Frac. Cov. (By Region):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for fractional coverage.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Number of MPDs (By Region):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for number of MPDs.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm MPDs (By Region):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the number of MPDs without corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm % (By Region):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the percentage of MPDs that did have any corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>CSI (By Season):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for CSI, with each year's statistics being divided up by the meteorological
                          season in which the MPD was issued. See the "Seasonal" section for more information on the seasons that are
                          chosen.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Frequency Bias (By Season):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for frequency bias.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Frac. Cov. (By Season):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for fractional coverage.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Number of MPDs (By Season):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for number of MPDs.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm MPDs (By Season):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the number of MPDs without corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm % (By Season):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the percentage of MPDs that did have any corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>CSI (By Event Type):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for CSI, with each year's statistics being divided up by the type of flash
                          flood event/source of the event responsible for prompting the issuance of an MPD. See below for more information
                          on the storm types and methods for assessing this.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Frequency Bias (By Event Type):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for frequency bias.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>Frac. Cov. (By Event Type):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for fractional coverage.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm MPDs (By Event Type):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the number of MPDs without corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>False Alarm % (By Event Type):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Same as above for the percentage of MPDs that did have any corresponding UFVS observations.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>MPD Size:</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> Average size of all MPDs in each year of record (2018-present).
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>MPD Size (By Region):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, with the average size of the MPDs divided by the region in which the MPD was
                          issued.
                        </li>
                      </ul>
                    </ul>

                    <ul className="list-disc pl-5">
                      <li>
                        <b>MPD Size (By Season):</b>
                      </li>
                      <ul className="list-disc pl-10">
                        <li>
                          <b>Description:</b> As above, with the average size of the MPDs divided by the season in which the MPD was
                          issued.
                        </li>
                      </ul>
                    </ul>
                  </AccordionDetails>
                </Accordion>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="mainpanel1-content"
                id="mainpanel1-header"
              >
                <Typography variant="h6"><b>Regional Info</b></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ul className="list-disc pl-5">
                  <li>Regional statistics are calculated for all MPDs in a selected time frame that fall mostly or completely within one of the regions shown in this figure:</li>
                  <br/>
                  <img src="regions.png"/>
                  <br/>
                  <li>Each MPD is assigned a region based on the aerial overlap between the MPD and each region. Whichever region the MPD overlaps most is the region to which it is assigned.</li>
                  <li>In the area encompassing Idaho, Montana, and part of Wyoming, there is a relative “drought” of MPDs, meaning there are very few issued for that area. If an MPD is issued in that part of the country, the MPD is assigned to whichever region it overlaps most.</li>
                  <li>The regions of the country were chosen with forecaster input based on the convective character of the area. For example, the Southwest region was designed to capture the monsoon.</li>
                </ul>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="mainpanel1-content"
                id="mainpanel1-header"
              >
                <Typography variant="h6"><b>Event Type Info</b></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ul className="list-disc pl-5">
                  <li>Various events are responsible for causing flash flooding, which may prompt the issuance of an MPD. These events may have very different characteristics, which can lead to major differences in predictability. For this reason, we chose to subset the MPD verification by some of the obvious event types. There are 8 categories currently, and MPDs are assigned to one of each of these categories based on keywords found in the text discussion portion of the product. The table of keywords is shown here:</li>
                  <br/>
                   <div className="container mx-auto">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-lg">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Event Category</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Keywords</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Atmospheric River</td>
                            <td className="border border-gray-300 px-4 py-3">
                              atmospheric river, AR, pineapple express, pineapple connection, IVT, integrated vapor transport
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Tropical Cyclone</td>
                            <td className="border border-gray-300 px-4 py-3">
                              tropical cyclone, tropical storm, tropical depression, subtropical storm, hurricane
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Monsoon</td>
                            <td className="border border-gray-300 px-4 py-3">monsoon, dry wash, slot canyon, arroyo</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Low-Level Jet</td>
                            <td className="border border-gray-300 px-4 py-3">
                              nocturnal jet, LLJ, low level jet, low-level jet, return flow
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">MCS/MCV</td>
                            <td className="border border-gray-300 px-4 py-3">
                              MCS, MCC, MCV, QLCS, linear training, squall line, mesoscale convective system, mesoscale convective
                              complex, mesoscale convective vortex, convective line
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Tropical (non-TC)</td>
                            <td className="border border-gray-300 px-4 py-3">
                              tropical convection, tropical disturbance, tropical moisture, tropical low, convective low, tropical
                              wave, easterly wave
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Front</td>
                            <td className="border border-gray-300 px-4 py-3">
                              cold front, warm front, stationary front, frontal, frontogenesis, frontogenetic
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Other</td>
                            <td className="border border-gray-300 px-4 py-3">
                              Includes the MPDs that do not fall into any other category
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <br/>
                  <li>It should be noted that our method does not permit double counting. For example, there may be an MPD text discussion that mentions an “atmospheric river” as well as a “front”, but the MPD will only be classified as an AR MPD since that keyword was found first.</li>
                </ul>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="mainpanel1-content"
                id="mainpanel1-header"
              >
                <Typography variant="h6"><b>Webpage Help</b></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ul className="list-disc pl-5">
                  <li>First, select the verification period you want to view plots for using the toggle buttons at the top of the page. The options are: </li>
                  <ul className="list-disc pl-10">
                    <li>Monthly</li>
                    <li>Seasonal</li>
                    <li>Annual</li>
                    <li>Multi-year</li>
                  </ul>
                  <li>Next, depending on your selection of verification period, select from "Year", "Month", "Season", or "Plot" dropdown menus. After a selection is made, the displayed image will update accordingly.</li>
                  <li>You can make the image full screen by clicking on it.</li>
                  <li>To return to the interactive MPD verification map, click the "Individual MPD Statistics" button.</li>
                </ul>
              </AccordionDetails>
            </Accordion>

          </DialogContent>
        </>
        }
      </Dialog>
    )
}

export default AboutModal;