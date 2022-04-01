import { defineConfig } from 'vite'
import { resolve } from "path";

export default defineConfig({
    base: '/ld50/',
    resolve: {
        alias: {
            "~": resolve(__dirname, "src"),
        },
    }
});
