import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

import { createClient } from '@/helpers/tgAPI'
import { ignoreOld, sequentialize } from 'grammy-middlewares'
import { run } from '@grammyjs/runner'
//import { selectSummaryPeriod } from '@/menus/inline/summary'
import { selectSummaryPeriod } from '@/menus/inline/summary'
import { selectUserGroup } from '@/menus/inline/showUserGroup'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleLanguage from '@/handlers/language'
import i18n from '@/helpers/i18n'
import languageMenu from '@/menus/inline/language'
import selectStep from '@/handlers/selectStep'
import sendStart from '@/handlers/start'
import startMongo from '@/helpers/startMongo'

async function runApp() {
  console.log('Starting app...')
  // User
  await createClient()
  console.log('User bot connected')
  // Mongoc
  await startMongo()
  console.log('Mongo connected')

  bot
    // Middlewares
    .use(sequentialize())
    .use(ignoreOld())
    .use(attachUser)
    .use(i18n.middleware())
    .use(configureI18n)
    // Menus
    .use(languageMenu)
  // Commands
  bot.command(['start'], sendStart)
  bot.command('language', handleLanguage)
  bot.on('message', selectStep)

  bot.callbackQuery(
    ['previous_my', 'next_my', 'change_words', 'delete'],
    selectUserGroup
  )
  bot.callbackQuery(['1h', '1d', '2d', '7d'], selectSummaryPeriod)

  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  run(bot)
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}

void runApp()
