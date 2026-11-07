import { writeSync } from 'node:fs'
import { Writable } from 'node:stream'
import { createElement as h, useActionState } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { createServerReference } from 'react-server-dom-webpack/client.node'

const log = (msg) => writeSync(1, msg + '\n') // sync, works while the loop is starved
const mode = process.argv[2]

const ACTION_ID = 'actions#signIn'
const signIn = createServerReference(ACTION_ID, async () => {})

let renders = 0
function SignInForm({ replyTo }) {
  renders++
  if (renders <= 3 || [10, 100, 1000, 10000, 100000].includes(renders)) {
    log(`  SignInForm render #${renders}`)
  }
  // `.bind()` in render is the documented way to pass extra args to an action
  const action = mode === 'bound' ? signIn.bind(null, replyTo) : signIn
  const [state, formAction] = useActionState(action, null)
  return h('form', { action: formAction }, h('button', null, 'Sign in'), state)
}

// What the server passes to Fizz after decoding a native form POST:
// [actionResult, postbackKey, referenceId, numberOfBoundArgs]
const formState = ['error', 'k-postback', ACTION_ID, mode === 'bound' ? 1 : 0]

setTimeout(() => {
  log('  event loop still alive after 1s (a timer fired)')
  process.exit(0)
}, 1000)

let html = ''
renderToPipeableStream(h(SignInForm, { replyTo: '/orders' }), {
  formState,
  onAllReady() {
    log(`  render finished after ${renders} render(s)`)
  },
  onError(e) {
    log('  onError: ' + e)
  },
}).pipe(
  new Writable({
    write(chunk, _enc, cb) {
      html += chunk
      cb()
    },
  }),
)
