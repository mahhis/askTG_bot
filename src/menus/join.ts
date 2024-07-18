import { InlineKeyboard } from 'grammy'

export default function createJoinMenu() {
  const selectionMenu = new InlineKeyboard()

  selectionMenu.text('join', 'join')

  return selectionMenu
}
