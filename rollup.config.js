import copy from 'rollup-plugin-copy';
import { terser } from "rollup-plugin-terser";
import resolve from '@rollup/plugin-node-resolve';
module.exports = {
    input: 'src/index.js',
    output: [

        { file: 'dist/index.js', format: 'iife' },
        { file: 'dist/index.min.js', format: 'iife',  plugins: [terser()], sourcemap: true, },
    ],

    plugins: [
        resolve(),
        copy({
            targets: [
                { src: 'public/**/*', dest: 'dist' },
            ]
        })
    ]
};