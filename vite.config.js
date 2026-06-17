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
})
