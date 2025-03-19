import Context from '@/models/Context'
import getI18nKeyboard from '@/menus/custom/default'
import sendOptions from '@/helpers/sendOptions'

export default async function handleStart(ctx: Context) {
  ctx.dbuser.step = 'main_menu'
  await ctx.dbuser.save()
  return await ctx.replyWithLocalization('main_menu', {
    ...sendOptions(ctx),
    reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
  })
}
