const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')
const stringSession = new StringSession('')
import env from '@/helpers/env'
const lunchClient = async () => {
  console.log('Loading interactive example...')
  const client = new TelegramClient(stringSession, +env.API_ID, env.API_HASH, {
    connectionRetries: 5,
  })

  await client.start({
    phoneNumber: async () =>
      await input.text('Please enter your phone number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () =>
      await input.text('Please enter the code you received: '),
    onError: (err) => console.log(err),
  })

  console.log('You should now be connected.')
  console.log('Session string:', client.session.save()) // Save this string to avoid logging in again
  await client.sendMessage('me', { message: 'Hello!' })
}
await lunchClient()
