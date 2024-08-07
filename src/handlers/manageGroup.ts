import { type Message } from '@grammyjs/types'

import { createUserGroupsMenu } from '@/menus/inline/showUserGroup'
import { joinTheGroup } from '@/helpers/tgAPI'
import { title } from 'process'
import Context from '@/models/Context'
import getI18nKeyboard from '@/menus/custom/default'
import i18n from '@/helpers/i18n'
import sendOptions from '@/helpers/sendOptions'

export async function handleAddGroup(ctx: Context) {
  ctx.dbuser.step = 'setup_group'
  await ctx.dbuser.save()
  return ctx.replyWithLocalization('send_link', {
    ...sendOptions(ctx),
    reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main_menu'),
  })
}

export async function handleMonitorGroup(ctx: Context) {
  if (ctx.dbuser.groups.length == 0) {
    return await ctx.replyWithLocalization('no_group_to_monitor', {
      ...sendOptions(ctx),
      reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
    })
  } else {
    let link = ''
    if (ctx.dbuser.groups[0].username) {
      link = '@' + ctx.dbuser.groups[0].username
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
      reply_markup: createUserGroupsMenu(ctx, 0, ctx.dbuser.groups!.length),
    })
  }
}

export async function handleLinkToGroup(ctx: Context, msg: Message) {
  const userNameGroup = getLinkToGroup(ctx, msg)

  const groupExists = ctx.dbuser.groups.some(
    (group) => group.username === userNameGroup
  )

  if (groupExists) {
    ctx.dbuser.step = 'main_menu'
    await ctx.dbuser.save()
    return ctx.replyWithLocalization('group_already_exists', {
      ...sendOptions(ctx),
      reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main'),
    })
  }

  await joinTheGroup(userNameGroup, ctx)

  ctx.dbuser.step = 'setup_words'
  await ctx.dbuser.save()
  return ctx.replyWithLocalization('setup_words', {
    ...sendOptions(ctx),
    reply_markup: getI18nKeyboard(ctx.dbuser.language, 'main_menu'),
  })
}

export function getLinkToGroup(ctx: Context, message: Message) {
  const groupLinkRegex = /https:\/\/t\.me\/([a-zA-Z0-9_]+)|@([a-zA-Z0-9_]+)/
  if (message.text) {
    const match = message.text.match(groupLinkRegex)
    if (match) {
      const username = match[1] || match[2]
      return username
    }
  }
  return ''
}
