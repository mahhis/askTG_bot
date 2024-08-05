import { InlineKeyboard } from 'grammy'
import getI18nKeyboard from '@/menus/custom/default'

import * as dayjs from 'dayjs'
import { getMessagesForPeriod } from '@/helpers/tgAPI'
import Context from '@/models/Context'
import i18n from '@/helpers/i18n'
import sendOptions from '@/helpers/sendOptions'

export const selectSummaryPeriod = async (ctx: Context) => {
  const selection = ctx.callbackQuery?.data
  const selectedGroup = ctx.dbuser.groups[ctx.dbuser.currentGroupIndex]
  const now = new Date()

  switch (selection) {
    case '1h': {
      const oneHourAgo = dayjs(now).subtract(1, 'hour').toDate()
      const messagesLastHour = await getMessagesForPeriod(
        selectedGroup.username!,
        selectedGroup.id,
        oneHourAgo
      )
      console.log('Messages from the last 1 hour:', messagesLastHour)
      break
    }
    case '1d': {
      const oneDayAgo = dayjs(now).subtract(1, 'day').toDate()
      const messagesLastHour = await getMessagesForPeriod(
        selectedGroup.username!,
        selectedGroup.id,
        oneDayAgo
      )
      console.log('Messages from the last 1 day:', messagesLastHour)
      break
    }
    case '2d': {
      const twoDaysAgo = dayjs(now).subtract(2, 'day').toDate()
      const messagesLastHour = await getMessagesForPeriod(
        selectedGroup.username!,
        selectedGroup.id,
        twoDaysAgo
      )
      console.log('Messages from the last 2 day:', messagesLastHour)
      break
    }
    case '7': {
      const sevenDaysAgo = dayjs(now).subtract(7, 'day').toDate()
      const messagesLastHour = await getMessagesForPeriod(
        selectedGroup.username!,
        selectedGroup.id,
        sevenDaysAgo
      )
      console.log('Messages from the last 7 day', messagesLastHour)
      break
    }
  }

  const message = ctx.i18n.t('unavailable_function', {
    ...sendOptions(ctx),
  })

  await ctx.deleteMessage()

  return await ctx.replyWithLocalization(message, {
    parse_mode: 'HTML',
    reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
  })
}

export function createSummaryPeriodMenu(ctx: Context) {
  const selectionMenu = new InlineKeyboard()

  const oneHour = '1h'
  const twentyFourHours = '1d'
  const twoDays = '2d'
  const sevenDays = '7d'

  selectionMenu.text(i18n.t(ctx.dbuser.language, 'one_hour_btn'), oneHour)

  selectionMenu
    .text(i18n.t(ctx.dbuser.language, 'twenty_four_hours_btn'), twentyFourHours)
    .row()

  selectionMenu.text(i18n.t(ctx.dbuser.language, 'two_days_btn'), twoDays)

  return selectionMenu.text(
    i18n.t(ctx.dbuser.language, 'seven_days__btn'),
    sevenDays
  )
}
