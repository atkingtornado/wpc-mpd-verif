import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  // Vite 8 uses Rolldown for dep optimization + build. Its CJS default interop
  // returns the whole module.exports object for legacy CJS packages that lack an
  // `exports` map (e.g. react-datepicker@4, copy-to-clipboard), which breaks
  // `import X from 'pkg'`. This flag restores the pre-Vite-8 (esbuild-style)
  // interop those packages were authored against. See the Vite 8 migration guide.
  legacy: {
    inconsistentCjsInterop: true,
  },
  // During local dev, proxy the verification data (and the shared boundary
  // overlays) to the live WPC mirror. This lets the app fetch the FFaIR_MPD
  // GeoJSON, the per-day Usernames files, and — crucially — the MPD_contour
  // directory listing (used to enumerate IRWs) without hitting CORS. In
  // production the app is served same-origin as the data, so no proxy is needed.
  server: {
    // Honor a harness/CI-assigned port if provided, otherwise Vite's default.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    proxy: {
      '/verification': {
        target: 'https://www.wpc.ncep.noaa.gov',
        changeOrigin: true,
        secure: true,
        // DEV-ONLY FIXTURE: the new usernames+validtimes JSONs are not on the
        // live server yet. Serve the local sample for the 2026-06-13 issuance
        // date so the IRW selection flow is testable in dev. Remove once the
        // real files are published. (No effect on the production build.)
        bypass: (req) => {
          if (req.url.endsWith('/Usernames/FFaIR_usernames_and_validtimes_20260613.json')) {
            return '/test-data/FFaIR_usernames_and_validtimes_20260613.json'
          }
        },
      },
    },
  },
})
