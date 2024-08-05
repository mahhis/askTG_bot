import { Api, TelegramClient } from 'telegram'
import { Group, findUsersByGroupId } from '@/models/User'
import { Raw } from 'telegram/events'
import { StringSession } from 'telegram/sessions'
import { fuzzy } from 'fast-fuzzy'
import Context from '@/models/Context'
import env from '@/helpers/env'
import i18n from '@/helpers/i18n'
import bigInt = require('big-integer')

let client: TelegramClient

export async function createClient() {
  const strSession = new StringSession(env.SESSION)
  const opts = {
    // connectionRetries: 5,
  }

  client = new TelegramClient(strSession, +env.API_ID, env.API_HASH, opts)
  await client.connect()
  await createEventHandler()

  return client
}

export async function joinTheGroup(name: string, ctx: Context) {
  try {
    const groups: Api.contacts.Found = await client.invoke(
      new Api.contacts.Search({
        q: name,
        limit: 5000,
      })
    )

    const filteredGroups: (Api.Channel & { username: string })[] = groups.chats
      .filter(hasUsernameAndIsChannel)
      .filter((chat) => chat.username === name)

    if (!filteredGroups.length) {
      console.log('No group found')
      return
    }
    try {
      await client.invoke(
        new Api.channels.JoinChannel({
          channel: name,
        })
      )

      const tempGroup: Group = {
        id: filteredGroups[0].id?.valueOf(),
        title: filteredGroups[0].title,
        username: filteredGroups[0].username!,
      }
      ctx.dbuser.groups.push(tempGroup)
      await ctx.dbuser.save()
    } catch (e) {
      console.log('no able to join')
    }
  } catch (error) {
    console.error('Error joining the group:', error)
    return []
  }
}

async function getAccessHash(groupName: string, id: bigint) {
  try {
    const searchResult = await client.invoke(
      new Api.contacts.Search({
        q: groupName,
        limit: 10,
      })
    )

    const filteredGroups = searchResult.chats.filter((chat) =>
      chat.id.equals(bigInt(id))
    ) as Api.Channel[]

    if (filteredGroups.length === 0) {
      console.log('No group found')
      return null
    }
    return filteredGroups[0].accessHash
  } catch (error) {
    console.error('Error getting group details:', error)
    return null
  }
}

async function createEventHandler() {
  client.addEventHandler(async (e) => {
    const events = ['UpdateNewChannelMessage', 'UpdateEditChannelMessage']
    if (!events.includes(e.className)) return

    const msg = e.message
    const groupId = e.message?.peerId?.channelId?.valueOf()

    const users = await findUsersByGroupId(groupId)

    for (const user of users) {
      for (const group of user.groups) {
        const fuzzyArr = group!.words!.map((word) =>
          fuzzy(word, msg.message, {
            ignoreCase: true,
            normalizeWhitespace: true,
          })
        )

        const matchedWords = group!.words!.filter(
          (_, idx) => fuzzyArr[idx] >= 0.5
        )
        const matchedScores = fuzzyArr.filter((score) => score >= 0.5)

        if (matchedWords.length === 0) continue

        const messageLink = `https://t.me/c/${groupId}/${msg.id}` // Generate the message link

        try {
          const matchMessage = i18n.t(user.language, 'match', {
            title: group.title,
            message: msg.message,
            matches: matchedWords
              .map(
                (word, idx) =>
                  `▫️ ${word} - ${(matchedScores[idx] * 100).toFixed(1)}%`
              )
              .join('\n'),
            messageLink,
          })

          const message = `<b>${matchMessage}</b>`

          await client.sendMessage(user.username, {
            message,
            parseMode: 'html',
          })
        } catch (e) {
          console.log('An error occurred while sending the message:', e)
        }
      }
    }
  }, new Raw({}))
}

function hasUsernameAndIsChannel(
  chat: Api.TypeChat
): chat is Api.Channel & { username: string } {
  return 'username' in chat && chat.className === 'Channel'
}

async function getAccessHashById(chatId: bigint) {
  try {
    const inputPeerChannel = new Api.InputPeerChannel({
      channelId: bigInt(chatId),
      accessHash: bigInt('0'), // Dummy access hash
    })

    const fullChannel = await client.invoke(
      new Api.channels.GetFullChannel({
        channel: inputPeerChannel,
      })
    )

    // Find the Channel object with the matching chatId
    const channel = fullChannel.chats.find((chat) =>
      chat.id.equals(bigInt(chatId))
    )

    if (channel && 'accessHash' in channel) {
      const accessHash = channel.accessHash
      return {
        id: chatId,
        accessHash: accessHash,
      }
    } else {
      console.log('Channel data not available')
      return null
    }
  } catch (error) {
    console.error('Error getting access hash by chat ID:', error)
    return null
  }
}

export async function getMessagesForPeriod(
  groupUsername: string,
  chatId: number,
  fromTime: Date
) {
  const fromTimestamp = Math.floor(fromTime.getTime() / 1000) // Convert to Unix timestamp
  const messages: Api.Message[] = []
  let offsetId = 0

  while (true) {
    const peer = new Api.InputPeerChannel({
      channelId: bigInt(chatId),
      accessHash: bigInt(/*getAccessHash(groupUsername, chatId)*/),
    }) // Use actual accessHash if available

    //console.log(getAccessHashById(bigInt(chatId)))

    const history = await client.invoke(
      new Api.messages.GetHistory({
        peer: peer,
        offsetId: offsetId,
        limit: 100,
      })
    )

    if (history instanceof Api.messages.Messages) {
      for (const message of history.messages) {
        if ('date' in message && message.date >= fromTimestamp) {
          messages.push(message as Api.Message)
        } else {
          return messages
        }
      }

      offsetId = history.messages[history.messages.length - 1].id
    } else {
      break
    }
  }

  return messages
}
