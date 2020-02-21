import copy from 'rollup-plugin-copy';
import { terser } from "rollup-plugin-terser";
import resolve from '@rollup/plugin-node-resolve';

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
export default {
    input: 'src/index.ts',
    output: [

        { file: 'dist/index.js', format: 'iife', name: 'index' },
        { file: 'dist/index.min.js', format: 'iife',  plugins: [terser({compress: true, mangle: true})], sourcemap: true, name: 'index' },
    ],

    plugins: [
        commonjs(
            {
                namedExports: {
                    'eventemitter3': ['EventEmitter']
                }
            }
        ),
        typescript(),
        resolve(),
        copy({
            targets: [
                { src: 'public/**/*', dest: 'dist' },
            ]
        })
    ]
};