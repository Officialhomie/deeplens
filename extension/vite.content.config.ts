import { defineConfig } from 'vite';

/**
 * The content script is built separately from the CRXJS pipeline.
 *
 * CRXJS ships ESM content scripts via a loader stub that `import()`s the real
 * chunk at runtime, which forces every one of those chunks into
 * `web_accessible_resources` — a set of stable URLs any page can probe to
 * detect that DeepLens is installed. `use_dynamic_url` is not a usable fix:
 * it rewrites the loader's origin while the chunk's own static imports keep
 * resolving to the extension origin, so the module graph fails to load.
 *
 * Building it as one self-contained IIFE removes the loader, the chunks, and
 * therefore the need for any web-accessible resource at all.
 */
export default defineConfig({
  build: {
    // CRXJS owns dist/ and runs first — never wipe its output.
    emptyOutDir: false,
    outDir: 'dist',
    sourcemap: false,
    target: 'chrome110',
    lib: {
      entry: 'src/content/index.ts',
      formats: ['iife'],
      name: 'DeepLensContent',
      fileName: () => 'content/deeplens.js',
    },
    rollupOptions: {
      output: {
        extend: true,
        // A lib/IIFE build cannot code-split; assert the single-file result.
        inlineDynamicImports: true,
      },
    },
  },
});
