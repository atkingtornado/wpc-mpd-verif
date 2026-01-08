# MPD Verification Website

This is the official codebase for the [MPD Verification tool](https://www.wpc.ncep.noaa.gov/mpd-verification/), developed using [React](https://reactjs.org/) and [Vite](https://vitejs.dev/). The application visualizes Mesoscale Precipitation Discussion (MPD) verification statistics produced by the Weather Prediction Center (WPC).

## Features

- **Dual MPD Selection Modes**:
  - Select by MPD number & year: Select an MPD by manually specifying the MPD number and issuance year.
  - Select by Date: Select an MPD from a list of MPDs issued for a given date.

- **MPD Info & Statistics Display**:
  - View various MPD verification statistics and metadata in a central display window.

- **Map Overlys**:
  - Overlay various relevant data layers such as LSRs, StageIV, etc.

- **Share Link**:
  - Generate a link to share a specific view with others.



## Prerequisites

- Node.js (v14.0.0 or higher)
- npm 

## Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)

## Getting Started

Follow the steps below to run the project locally.

### 1. Clone the Repository

```bash
git clone git@gitlab-ssh.nws.noaa.gov:wpc-operations/wpc-web/wpc-mpd-verif.git
cd wpc-mpd-verif
```

### 2. Install dependencies:

```bash
npm install
```

## Development

This project uses Vite as its build tool and development server. Vite provides fast hot module replacement (HMR) and optimized builds.

### Start Development Server

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`.

### Development Features

  - **Hot Module Replacement (HMR)**: Changes to your code will be reflected immediately without a full page reload
  - **Error Overlay**: Errors will be displayed in the browser
  - **ESLint Integration**: Code quality issues will be highlighted during development

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate optimized files in the `dist` directory.


## Dependencies

- **React:** UI library
- **react-map-gl** & **maplibre-gl**: Map rendering and interaction
- **react-select**: Enhanced dropdown selection
- **react-datepicker**: Date selection component
- **react-medium-image-zoom**: Image zoom functionality
- **@mui/material**: UI components (buttons, alerts, etc.)
- **@fortawesome/react-fontawesome**: Icon components
- **axios**: HTTP client for data fetching
- **dayjs**: Date manipulation
- **copy-to-clipboard**: Clipboard copy

## Usage

### Basic Use

- Use either method of MPD selection to load verification statistics and map data for a given MPD.
- Increment forward or backward in MPD number using the arrows within the statistics display window.
- Click on the MPD image in the bottom left of the screen to enlarge it
- Toggle the UI using the "eye" icon in the top left of the page

### Interactive Map View

- Use standard map controls for navigation:
    - Pan: Click and drag
    - Zoom: Scroll wheel
    - Rotate/Tilt: Right-click and drag
- Toggle layer visibility using the legend in the bottom-left corner of the page


## Customizing Vite Configuration

If you need to customize the Vite configuration, you can modify the `vite.config.js` file.
