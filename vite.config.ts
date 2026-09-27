import path from 'path';
import { defineConfig } from 'vite';

// Only VITE_-prefixed env vars reach the client bundle. Never inject other
// secrets here via `define` — everything in the bundle is public.
export default defineConfig(() => {
    return {
      base: '/portfolio/', // <-- set to your repo name
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
