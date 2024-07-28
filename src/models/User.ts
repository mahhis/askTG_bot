import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'


export class Group {
  @prop({ required: true })
  id!: number

  @prop({ required: true })
  title!: string

  @prop({ required: true })
  username?: string

  @prop({ type: () => [String] })
  words?: string[]
}


@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  @prop({ required: true, index: true, unique: true })
  id!: number
  @prop({ required: true, default: 'en' })
  language!: string
  @prop({})
  username?: string
  @prop({ required: true, default: 'start' })
  step!: string
  @prop({ type: () => [Group], default: [] })
  groups!: Group[]
  @prop({ default: 0 })
  currentGroupIndex!: number
  @prop({ required: true, default: 'NOT' }) // NOT, WAITING, ADDED
  inWaitList!: string
}

const UserModel = getModelForClass(User)

export async function findOrCreateUser(id: number) {
  return await UserModel.findOneAndUpdate(
    { id },
    {},
    {
      upsert: true,
      new: true,
    }
  )
}
export async function findUsersByGroupId(groupId: number){
  const users = await UserModel.find({
    groups: {
      $elemMatch: { id: groupId }
    }
  })

  return users;
}


export async function removeGroupFromUser(userId: number, groupId: number) {
  await UserModel.updateOne(
    { id: userId },
    { $pull: { groups: { id: groupId } } }
  )
}

