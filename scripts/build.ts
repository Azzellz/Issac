await Bun.build({
    entrypoints: ['./lib/index.ts'],
    outdir: './dist'
})
