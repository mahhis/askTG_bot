import { type Message } from '@grammyjs/types'
import Context from '@/models/Context'
import { getLinkToGroup, handleAddGroup, handleLinkToGroup, handleMonitorGroup } from '@/handlers/manageGroup'
import handleCancel from '@/handlers/cancel'
import handleStart from '@/handlers/start'
import i18n from '@/helpers/i18n'
import handleJoinWaitList from '@/handlers/join'
import { handleAddWords, handleChangeWords } from '@/handlers/words'

export default async function selectStep(ctx: Context) {
  const message = ctx.msg!

  if (isCancel(ctx, message) && ctx.dbuser.step !== 'start') {
    return handleCancel(ctx)
  }
  switch (ctx.dbuser.step) {
    case 'start':
      return await handleStart(ctx)
    case 'main_menu':
      if (isAddGroup(ctx, message)) { 
        return await handleAddGroup(ctx)
      } else if(isMonitorGroup(ctx, message)){
        return await handleMonitorGroup(ctx)
      }
    case 'wait_list':
      if (isJoin(ctx, message)) { 
      return await handleJoinWaitList(ctx)  
      }
    case 'setup_group':
      if (getLinkToGroup(ctx, message)) { 
      return await handleLinkToGroup(ctx, message)  
      }
    case 'setup_words':
      return await handleAddWords(ctx, message)
    case 'change_words':
      return await handleChangeWords(ctx, message)    
  }
}

function isCancel(ctx: Context, message: Message) {
  return message.text == i18n.t(ctx.dbuser.language, 'cancel')
}
function isJoin(ctx: Context, message: Message) {
  return message.text == i18n.t(ctx.dbuser.language, 'join_btn')
}
function isAddGroup(ctx: Context, message: Message) {
  return message.text == i18n.t(ctx.dbuser.language, 'add_group_btn')
}
function isMonitorGroup(ctx: Context, message: Message) {
  return message.text == i18n.t(ctx.dbuser.language, 'monitor_groups_btn')
}
