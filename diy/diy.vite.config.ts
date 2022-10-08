import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    root: 'diy',
    publicDir: './public',
    build: {
        outDir: 'diy-dist',
    },
    define: {
        __DIY__: true,
    },
    server: {
        host: true,
        port: 5556,
    },
});
