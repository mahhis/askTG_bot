import { findOrCreateUser } from '@/models/User'
import Context from '@/models/Context'
import createJoinMenu from '@/menus/join'
import sendOptions from '@/helpers/sendOptions'

export default function handleHelp(ctx: Context) {
  if (ctx.dbuser.inWaitingList) {
    return ctx.replyWithLocalization('already_in', sendOptions(ctx))
  } else {
    return ctx.replyWithLocalization('start', {
      ...sendOptions(ctx),
      reply_markup: createJoinMenu(),
    })
  }
}
