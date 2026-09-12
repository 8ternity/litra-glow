import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/plugin.ts',
  output: {
    dir: 'com.litra.glow.v2.sdPlugin/bin',
    format: 'cjs',
    exports: 'auto',
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    nodeResolve({
      browser: false,
      exportConditions: ['node'],
      preferBuiltins: true
    }),
    commonjs(),
    json()
  ],
  external: []
}; 