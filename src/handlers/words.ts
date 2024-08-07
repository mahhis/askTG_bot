import { type Message } from '@grammyjs/types'
import { createUserGroupsMenu } from '@/menus/inline/showUserGroup'
import Context from '@/models/Context'
import getI18nKeyboard from '@/menus/custom/default'
import i18n from '@/helpers/i18n'
import sendOptions from '@/helpers/sendOptions'

export async function handleAddWords(ctx: Context, msg: Message) {
  const wordsArray = msg
    .text!.split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0)

  ctx.dbuser.groups[ctx.dbuser.groups.length - 1].words = wordsArray
  ctx.dbuser.step = 'main_menu'
  await ctx.dbuser.save()
  return ctx.replyWithLocalization('successfull_set', {
    ...sendOptions(ctx),
    reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
  })
}

export async function handleChangeWords(ctx: Context, msg: Message) {
  const wordsArray = msg
    .text!.split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0)

  ctx.dbuser.groups[ctx.dbuser.currentGroupIndex].words = wordsArray
  ctx.dbuser.step = 'select_action_on_group'
  await ctx.dbuser.save()
  ctx.replyWithLocalization('words_changed', {
    ...sendOptions(ctx),
    reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
  })

  let link = ''
  if (ctx.dbuser.groups[ctx.dbuser.currentGroupIndex].username) {
    link = '@' + ctx.dbuser.groups[ctx.dbuser.currentGroupIndex].username
  } else {
    link = i18n.t(ctx.dbuser.language, 'absent')
  }

  const words = ctx.dbuser.groups[0].words!.join(', ')

  return ctx.replyWithLocalization('select_my_group', {
    ...sendOptions(ctx, {
      index: 1,
      length: ctx.dbuser.groups.length,
      title: ctx.dbuser.groups[0].title,
      link: link,
      words: words,
    }),
    reply_markup: createUserGroupsMenu(
      ctx,
      ctx.dbuser.currentGroupIndex,
      ctx.dbuser.groups!.length
    ),
  })
}
