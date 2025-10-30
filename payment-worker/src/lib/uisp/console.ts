import { env } from 'env.js'
import * as repl from 'repl'
import { createUispApi } from 'sdk/create-uisp-api.js'

const options: repl.ReplOptions = {
  prompt: 'wide > ',
  input: process.stdin,
  output: process.stdout,
  useGlobal: true,
}

const welcomeMessage = `
Welcome to the UISP console!

Type .options, to list all available options.
Type .help, to list all available commands.
`
console.log(welcomeMessage)

const replServer = repl.start(options)

replServer.on('exit', function () {
  console.log('Exiting console...')
})

replServer.defineCommand('options', {
  help: 'List all available options',
  action: function () {
    console.log('Available options:')
    console.log('.help - List all available options')
    console.log('.exit - Exit the REPL console')
    // Add more options here if needed
    this.displayPrompt()
  },
})

replServer.context.uisp = createUispApi(env.UISP_URL, env.UISP_KEY)
replServer.context.methods = (obj: any) => {
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(
    (method) =>
      method !== 'constructor' &&
      (typeof obj[method] === 'object' || typeof obj[method] === 'function'),
  )
  return methods
}
