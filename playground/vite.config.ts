import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { Plugin } from 'vite';
export default defineConfig({
    plugins: [
        vue(),
    ],
    publicDir: resolve(__dirname, 'public'),
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
});