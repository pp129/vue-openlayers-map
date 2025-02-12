import { resolve } from "path";
import { createVuePlugin } from "vite-plugin-vue2";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

const build = (env) => {
  if (env === "production") {
    return {
      outDir: "dist",
      rollupOptions: {
        input: [resolve(__dirname, "index.html")],
      },
    };
  } else if (env === "lib") {
    return {
      outDir: "lib",
      lib: {
        target: "esnext",
        entry: resolve(__dirname, "src/components/index.js"),
        name: "ol-map",
        formats: ["umd"],
        fileName: (format) => `ol-map.${format}.js`,
      },
      rollupOptions: {
        external: ["vue", "vue-router"],
        output: {
          globals: {
            vue: "Vue",
          },
          assetFileNames: "v-ol-map.[ext]",
        },
      },
      target: ["es2015"],
    };
  }
};

export default defineConfig(({ command, mode }) => {
  return {
    server: {
      host: "localhost",
      port: 8888,
      open: true,
      hmr: true,
    },
    publicDir: mode === "lib" ? false : "public",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    plugins: [
      createVuePlugin(),
      createHtmlPlugin({
        inject: {
          data: {
            injectScript:
              mode === "development"
                ? '<link rel="icon" type="image/svg+xml" href="/logo.svg">'
                : '<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">',
          },
        },
      }),
    ],
    esbuild: {
      drop: command === "build" ? ["console", "debugger"] : [],
    },
    build: build(mode),
  };
});
