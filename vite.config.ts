import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Vite marks the built stylesheet <link> as `crossorigin`, so the browser requests it with an
// Origin header. Render's static hosting answers that exact request for the CSS with a 404
// (the same file without the header is fine) — and the site shows up unstyled. Our CSS is on
// our own domain, so the attribute isn't needed: drop it from stylesheet links.
function sameOriginStylesheets(): Plugin {
  return {
    name: 'same-origin-stylesheets',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace(/<link rel="stylesheet" crossorigin /g, '<link rel="stylesheet" '),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sameOriginStylesheets()],
  resolve: {
    // "@/..." imports are defined once in tsconfig.app.json → paths
    tsconfigPaths: true,
  },
})
