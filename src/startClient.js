const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')
const stringSession = new StringSession('')

const startClient = async () => {
  console.log('Loading interactive example...')
  const client = new TelegramClient(
    stringSession,
    +'26840762',
    '2f77edb04c732fe250df087c2b2853c9',
    {
      connectionRetries: 5,
    }
  )

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

;(async () => {
  await startClient()
})()
