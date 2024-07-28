import Context from '@/models/Context'

export default async function handleJoinWaitList(ctx: Context) {
  ctx.dbuser.inWaitList = 'WAITING'
  ctx.dbuser.step = 'start'
  await ctx.dbuser.save()
  return ctx.replyWithLocalization('already_in', {
    parse_mode: 'HTML',
    reply_markup: { remove_keyboard: true },
  })
}
