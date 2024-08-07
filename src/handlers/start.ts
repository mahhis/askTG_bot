import { findOrCreateUser } from '@/models/User'
import Context from '@/models/Context'
import getI18nKeyboard from '@/menus/custom/default'
import sendOptions from '@/helpers/sendOptions'

export default async function handleStart(ctx: Context) {
  if (ctx.dbuser.inWaitList == 'NOT') {
    ctx.dbuser.step = 'wait_list'
    await ctx.dbuser.save()
    return ctx.replyWithLocalization('not_yet_on_waiting_list', {
      ...sendOptions(ctx),
      reply_markup: getI18nKeyboard(ctx.dbuser.language, 'wait_list'),
    })
  }
  if (ctx.dbuser.inWaitList == 'WAITING') {
    return ctx.replyWithLocalization('already_on_waiting_list', {
      ...sendOptions(ctx),
      reply_markup: { remove_keyboard: true },
    })
  }
  if (ctx.dbuser.inWaitList == 'ADDED') {
    ctx.dbuser.step = 'main_menu'
    await ctx.dbuser.save()
    return ctx.replyWithLocalization('main_menu', {
      ...sendOptions(ctx),
      reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
    })
  }
}
