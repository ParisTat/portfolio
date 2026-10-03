import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves static files only and cannot set HTTP response headers,
// so the CSP has to ship as a <meta http-equiv> tag instead. Keeping the
// directive list as a plain exported function (rather than inline in the
// plugin) lets it be unit-tested without spinning up a Vite build.
// Browsers ignore frame-ancestors, sandbox and report-uri in a <meta> CSP, so
// clickjacking protection is not possible on GitHub Pages.
export function buildContentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self'",
    // No 'unsafe-inline': React applies `style` props through the CSSOM, which CSP allows.
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://api.web3forms.com https://api.github.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://api.web3forms.com",
    'upgrade-insecure-requests',
  ];
  return directives.join('; ');
}

// Injects the CSP <meta> tag into dist/index.html at build time only, so the
// Vite dev server (and its HMR inline scripts / websocket) is unaffected.
function cspMetaPlugin(): Plugin {
  return {
    name: 'portfolio-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      const metaTag = `<meta http-equiv="Content-Security-Policy" content="${buildContentSecurityPolicy()}">`;
      return html.replace('<head>', `<head>\n    ${metaTag}`);
    },
  };
}

// Only VITE_-prefixed env vars reach the client bundle. Never inject other
// secrets here via `define` — everything in the bundle is public.
export default defineConfig(({ command }) => {
    return {
      base: '/portfolio/', // <-- set to your repo name
      plugins: [tailwindcss(), cspMetaPlugin()],
      // Production builds strip every console.* call and debugger statement, ours and
      // dependencies' (esbuild applies `drop` while minifying each chunk). Dev keeps them.
      // Note for a Vite 8 upgrade: minification moves to Oxc, where this option differs.
      esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : undefined,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
