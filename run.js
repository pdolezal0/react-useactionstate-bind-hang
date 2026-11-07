import { spawnSync } from 'node:child_process'

for (const mode of ['unbound', 'bound']) {
  console.log(`\n== ${mode} action passed to useActionState`)
  const r = spawnSync(process.execPath, ['render.js', mode], {
    stdio: 'inherit',
    timeout: 5000,
  })
  if (r.signal) {
    console.log(`  HUNG: killed by parent after 5s (${r.signal}), no timer ever fired`)
  }
}
