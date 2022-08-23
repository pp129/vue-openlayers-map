import { resolve } from 'path'
import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig } from 'vite'

const build = (env) => {
  if (env === 'production') {
    return {
      outDir: 'dist',
      rollupOptions: {
        input: [resolve(__dirname, 'index.html')]
      }
    }
  } else if (env === 'lib') {
    return {
      outDir: 'lib',
      lib: {
        target: 'esnext',
        entry: resolve(__dirname, 'src/components/index.js'),
        name: 'ol-map',
        formats: ['umd'],
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
      target: ['es2015']
    }
  }
}

export default defineConfig(({ command, mode }) => {
  return {
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
    plugins: [
      createVuePlugin()
    ],
    esbuild: {
      drop: ['console', 'debugger']
    },
    build: build(mode)
  }
})
