import { InlineKeyboard } from 'grammy'
import getI18nKeyboard from '@/menus/custom/default'

import Context from '@/models/Context'
import i18n from '@/helpers/i18n'
import sendOptions from '@/helpers/sendOptions'
import { removeGroupFromUser } from '@/models/User'

export const selectSummaryPeriod = async (ctx: Context) => {
  
    const message = ctx.i18n.t('unavailable_function', {
      ...sendOptions(ctx),
    })

    await ctx.deleteMessage()

    return await ctx.replyWithLocalization(message, {
      parse_mode: 'HTML',
      reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
    })
  }


export function createSummaryPeriodMenu(
  ctx: Context,
) {
  const selectionMenu = new InlineKeyboard()

  let oneHour = '1h'
  let twentyFourHours = '24h'
  let twoDays = '2d'
  let sevenDays = '7d'

  selectionMenu.text(
    i18n.t(ctx.dbuser.language, 'one_hour_btn'),
    oneHour
  )

  selectionMenu.text(
    i18n.t(ctx.dbuser.language, 'twenty_four_hours_btn'),
    twentyFourHours
  ).row()

  selectionMenu.text(
    i18n.t(ctx.dbuser.language, 'two_days_btn'),
    twoDays
  )


  return selectionMenu.text(
    i18n.t(ctx.dbuser.language, 'seven_days__btn'),
    sevenDays
  )
}
