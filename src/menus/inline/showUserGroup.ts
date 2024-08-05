import { InlineKeyboard } from 'grammy'
import getI18nKeyboard from '@/menus/custom/default'

import { createSummaryPeriodMenu } from '@/menus/inline/summary'
import { removeGroupFromUser } from '@/models/User'
import Context from '@/models/Context'
import i18n from '@/helpers/i18n'
import sendOptions from '@/helpers/sendOptions'

export const selectUserGroup = async (ctx: Context) => {
  const selection = ctx.callbackQuery?.data
  const currentSetupingGroups = ctx.dbuser.groups!

  if (selection == 'previous_my' && ctx.dbuser.currentGroupIndex! > 0) {
    ctx.dbuser.currentGroupIndex = ctx.dbuser.currentGroupIndex! - 1
    await ctx.dbuser.save()
  }

  if (
    selection == 'next_my' &&
    ctx.dbuser.currentGroupIndex! < currentSetupingGroups.length
  ) {
    ctx.dbuser.currentGroupIndex = ctx.dbuser.currentGroupIndex! + 1
    await ctx.dbuser.save()
  }

  const group = ctx.dbuser.groups![ctx.dbuser.currentGroupIndex]

  if (selection == 'summary') {
    ctx.dbuser.step = 'select_period_summary'
    await ctx.dbuser.save()

    const summaryPeriodMenu = await createSummaryPeriodMenu(ctx)
    const message = ctx.i18n.t('select_summary_period', {
      ...sendOptions(ctx),
    })

    return await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: summaryPeriodMenu,
    })
  }

  if (selection == 'change_words') {
    ctx.dbuser.step = 'change_words'
    await ctx.dbuser.save()
    return await ctx.replyWithLocalization('new_words_for_group', {
      ...sendOptions(ctx),
      reply_markup: getI18nKeyboard(ctx.dbuser.language, 'cancel'),
    })
  }

  if (selection == 'delete') {
    await removeGroupFromUser(ctx.dbuser.id, group.id)

    await ctx.deleteMessage()
    await ctx.replyWithLocalization('group_deleted', {
      ...sendOptions(ctx),
      reply_markup: getI18nKeyboard(ctx.dbuser.language, 'cancel'),
    })

    if (currentSetupingGroups.length - 1 == 0) {
      ctx.dbuser.step = 'main_menu'
      await ctx.dbuser.save()
      return await ctx.replyWithLocalization('no_group_to_monitor', {
        ...sendOptions(ctx),
        reply_markup: getI18nKeyboard(ctx.dbuser.language, 'cancel'),
      })
    } else {
      let link = ''
      if (ctx.dbuser.groups[0].username) {
        link = '@' + ctx.dbuser.groups[0].username
      } else {
        link = i18n.t(ctx.dbuser.language, 'absent')
      }
      const words = ctx.dbuser.groups[0].words!.join(', ')
      return await ctx.replyWithLocalization('select_my_group', {
        ...sendOptions(ctx, {
          index: 1,
          length: ctx.dbuser.groups.length,
          title: ctx.dbuser.groups[0].title,
          link: link,
          words: words,
        }),
        reply_markup: getI18nKeyboard(ctx.dbuser.language, 'cancel'),
      })
    }
  }

  const menu = createUserGroupsMenu(
    ctx,
    ctx.dbuser.currentGroupIndex!,
    currentSetupingGroups.length
  )

  if (
    ctx.dbuser.currentGroupIndex! >= 0 &&
    ctx.dbuser.currentGroupIndex! < currentSetupingGroups.length
  ) {
    let link = ''
    if (ctx.dbuser.groups[ctx.dbuser.currentGroupIndex].username) {
      link = '@' + ctx.dbuser.groups[ctx.dbuser.currentGroupIndex].username
    } else {
      link = i18n.t(ctx.dbuser.language, 'absent')
    }

    const words =
      ctx.dbuser.groups[ctx.dbuser.currentGroupIndex].words!.join(', ')

    const message = ctx.i18n.t('select_my_group', {
      ...sendOptions(ctx, {
        index: ctx.dbuser.currentGroupIndex + 1,
        length: ctx.dbuser.groups.length,
        title: ctx.dbuser.groups[ctx.dbuser.currentGroupIndex].title,
        link: link,
        words: words,
      }),
    })

    return await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: menu,
    })
  }
}

export function createUserGroupsMenu(
  ctx: Context,
  groupCurrntIndex: number,
  currentOrdersRequestLenght: number
) {
  const selectionMenu = new InlineKeyboard()

  let previousButtonText = '<<'
  let nextButtonText = '>>'

  if (groupCurrntIndex == 0) {
    previousButtonText = '⏹️'
    selectionMenu.text(previousButtonText, 'none')
  } else {
    selectionMenu.text(previousButtonText, 'previous_my')
  }
  if (groupCurrntIndex + 1 == currentOrdersRequestLenght) {
    nextButtonText = '⏹️'
    selectionMenu.text(nextButtonText, 'none').row()
  } else {
    selectionMenu.text(nextButtonText, 'next_my').row()
  }
  selectionMenu
    .text(i18n.t(ctx.dbuser.language, 'summary_btn'), 'summary')
    .row()

  selectionMenu
    .text(i18n.t(ctx.dbuser.language, 'change_words_btn'), 'change_words')
    .row()

  return selectionMenu.text(
    i18n.t(ctx.dbuser.language, 'delete_group_btn'),
    'delete'
  )
}
