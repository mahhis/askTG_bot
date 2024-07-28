import { Keyboard } from 'grammy'
import i18n from '@/helpers/i18n'

export default function getI18nKeyboard(lng: string, type: string) {
  let keyboard: Keyboard

  switch (type) {
    case 'main':
      keyboard = new Keyboard()
        .text(i18n.t(lng, 'add_group_btn'))
        .row()
        .text(i18n.t(lng, 'monitor_groups_btn'))
        .row()
        .text(i18n.t(lng, 'cancel'))
        .resized()  
      return keyboard
    case 'wait_list':
      keyboard = new Keyboard()
        .text(i18n.t(lng, 'join_btn'))
        .row()
        .text(i18n.t(lng, 'cancel'))
        .resized()  
      return keyboard
    case 'finish':
      keyboard = new Keyboard()
        .text(i18n.t(lng, 'finish_btn'))
        .row()
        .text(i18n.t(lng, 'cancel'))
        .resized()
      return keyboard    
  }
}
