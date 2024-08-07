import getI18nKeyboard from '@/menus/custom/default'

import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default async function handleCancel(ctx: Context) {
  ctx.dbuser.step = 'main_menu'
  ctx.dbuser.currentGroupIndex = 0
  await ctx.dbuser.save()
  return ctx.replyWithLocalization('cancel_selected', {
    ...sendOptions(ctx),
    reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
  })
}
