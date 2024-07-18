import Context from '@/models/Context'

export default async function join(ctx: Context) {
  ctx.dbuser.inWaitingList = true
  await ctx.dbuser.save()
  return ctx.editMessageWithLocalization('already_in', {
    parse_mode: 'HTML',
    reply_markup: undefined,
  })
}
