import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    graph: 'src/graph/index.ts',
    timeline: 'src/timeline/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'react-force-graph-2d',
    '@xyflow/react',
    'vis-timeline',
    'vis-data',
  ],
})
