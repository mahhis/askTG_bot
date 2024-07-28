import { Api, TelegramClient } from 'telegram'
import env from '@/helpers/env'
import { StringSession } from 'telegram/sessions'
import { fuzzy } from 'fast-fuzzy'
import { Raw } from 'telegram/events'
import Context from '@/models/Context'
import { findUsersByGroupId, Group } from '@/models/User'
import i18n from './i18n'


let client: TelegramClient 


export async function createClient() {
    const strSession = new StringSession(env.SESSION)
    const opts = {
        // connectionRetries: 5,
      }
  
    client = new TelegramClient(strSession, + env.API_ID, env.API_HASH, opts)
    await client.connect()
    await createEventHandler()

  
    return client
  }


  export async function joinTheGroup(name: string, ctx: Context ) {
    try {
      let groups: Api.contacts.Found = await client.invoke(
        new Api.contacts.Search({
          q: name,
          limit: 5000,
        })
      )
  
      const filteredGroups: (Api.Channel & { username: string })[] = groups.chats
      .filter(hasUsernameAndIsChannel)
      .filter(chat => chat.username === name);

    if (!filteredGroups.length) {
      console.log('No group found');
      return;
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


  async function createEventHandler() {
    client.addEventHandler(async e => {

      const events = ['UpdateNewChannelMessage', 'UpdateEditChannelMessage']
      if (!events.includes(e.className)) return
  
      const msg = e.message
      const groupId = e.message?.peerId?.channelId?.valueOf()
  
      const users = await findUsersByGroupId(groupId)
  
      for (let user of users) {
        for (let group of user.groups) {
          const fuzzyArr = group!.words!.map(word =>
            fuzzy(word, msg.message, {
              ignoreCase: true,
              normalizeWhitespace: true,
            })
          )
  
          const matchedWords = group!.words!.filter((_, idx) => fuzzyArr[idx] >= 0.5)
          const matchedScores = fuzzyArr.filter(score => score >= 0.5)
  
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

 
function hasUsernameAndIsChannel(chat: Api.TypeChat): chat is Api.Channel & { username: string } {
    return 'username' in chat && chat.className === 'Channel';
  }