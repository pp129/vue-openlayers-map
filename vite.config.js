import { resolve } from 'path'
import { createVuePlugin } from 'vite-plugin-vue2'

export default {
  server: {
    host: 'localhost',
    port: 8080,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [createVuePlugin()],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/components/index.js'),
      name: 'ol-map',
      fileName: (format) => `ol-map.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
