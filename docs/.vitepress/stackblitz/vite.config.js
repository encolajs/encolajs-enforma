"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_vue_1 = require("@vitejs/plugin-vue");
var vite_2 = require("@nuxt/ui/vite");
var vite_plugin_dts_1 = require("vite-plugin-dts");
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, plugin_vue_1.default)(),
        (0, vite_2.default)({
            // this example doesn't use vue-router
            router: false,
            // Nuxt UI form controls are inline by default; make them fill the field
            ui: {
                input: { slots: { root: 'w-full' } },
                inputDate: { slots: { base: 'w-full' } },
                textarea: { slots: { root: 'w-full' } },
                select: { slots: { base: 'w-full' } },
            },
        }),
        (0, vite_plugin_dts_1.default)(),
    ],
    resolve: {
        alias: {
            '@': '/src'
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    }
});
