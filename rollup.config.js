import resolve from 'rollup-plugin-node-resolve';

export default {
  // If using any exports from a symlinked project, uncomment the following:
  // preserveSymlinks: true,
	input: ['index.js'],
	output: {
		file: 'dist/main.js',
		format: 'es',
		sourcemap: true
	},
	plugins: [
    resolve()
  ]
};

