# useActionState + bound Server Action: infinite render loop during MPA postback SSR

Minimal reproduction with only `react`, `react-dom` and `react-server-dom-webpack` (no framework).

```sh
npm install --legacy-peer-deps   # skips the unused webpack peer
npm run repro
```

`render.js` server-renders a form whose action is passed to `useActionState`, with `formState` set as after a native (no-JS) form POST. `run.js` runs it twice in a child process, once with the plain server reference and once with `serverReference.bind(null, replyTo)`.

## Output (react 19.3.1, also 19.3.0-canary-5b610964-20261106, Node 24)

```
== unbound action passed to useActionState
  SignInForm render #1
  render finished after 1 render(s)
  event loop still alive after 1s (a timer fired)

== bound action passed to useActionState
  SignInForm render #1
  SignInForm render #2
  SignInForm render #3
  SignInForm render #10
  SignInForm render #100
  SignInForm render #1000
  SignInForm render #10000
  SignInForm render #100000
  HUNG: killed by parent after 5s (SIGTERM), no timer ever fired
```

The bound case never finishes and starves the event loop: the 1s timer never fires.
