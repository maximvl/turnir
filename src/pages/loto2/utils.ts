import { sample, sampleSize, uniq } from 'lodash'
import { ChatUser } from '@/pages/turnir/api'
import { Ticket2 as Ticket } from './types'

type Props = {
  owner_id: number
  owner_name: string
  drawOptions: string[]
  source: 'chat' | 'points'
  text?: string
}

export function genTicket({
  owner_id,
  owner_name,
  drawOptions,
  source,
  text,
}: Props): Ticket {
  const value = genTicketNumber(drawOptions, text)
  return {
    id: Math.random().toString(36).substring(2, 9),
    owner_id,
    owner_name,
    value,
    color: sample([
      '#634f5f', // dark red
      '#654b3c', // brown
      '#4a4857', // greyish
      '#0c5159', // dark green
    ]),
    variant: sample([0, 1, 2, 3, 4, 5, 6, 7]),
    source,
  } as Ticket
}

function genTicketNumber(drawOptions: string[], text?: string) {
  if (!text) {
    return sampleSize(drawOptions, 8)
  }

  // const regex = /(?:\b\d{1,2}\b\s*){8}/

  // if (!text.match(regex)) {
  //   return null
  // }

  const trimmed = text.trim()
  const ticket = uniq(
    trimmed
      .split(' ')
      .map((n) => parseInt(n))
      .filter((n) => n > 0 && n < 100)
      .map((n) => {
        if (n < 10) {
          return `0${n}`
        }
        return n.toString()
      })
  )

  if (ticket.length < 8) {
    // add non-matching draw options
    const sampleOptions = sampleSize(drawOptions, 10)
    const validOptions = sampleOptions.filter((o) => !ticket.includes(o))
    ticket.push(...sampleSize(validOptions, 8 - ticket.length))
  }
  if (ticket.length > 8) {
    // limit to 5 items
    ticket.slice(0, 5)
  }
  return ticket
}

export const NumberToFancyName: { [k: string]: string } = {
  '01': 'Кол',
  '02': 'Гусь',
  '03': 'На троих',
  '04': 'Стул',
  '07': 'Топор',
  '08': 'Кольца',
  '10': 'Часовой',
  '11': 'Барабанные палочки',
  '12': 'Дюжина',
  '13': 'Чертова дюжина',
  '20': 'Лебединое озеро',
  '21': 'Очко',
  '22': 'Два гуся',
  '23': 'Два притопа, три прихлопа',
  '24': 'Лебедь на стуле',
  '25': 'Опять двадцать пять',
  '27': 'Клуб 27',
  '33': 'Кудри',
  '38': '38 попугаев',
  '41': 'Ем один',
  '42': 'Главный вопрос жизни, Вселенной и вообще',
  '43': 'Сталинград',
  '44': 'Стульчики',
  '45': 'Баба ягодка опять',
  '47': 'Баба ягодка совсем',
  '48': 'Половинку просим',
  '50': 'Полста',
  '51': 'Великолепная пятерка и вратарь',
  '55': 'Перчатки',
  '61': 'Гагарин',
  '63': 'Терешкова',
  '66': 'Валенки',
  '69': 'MHMM',
  '70': 'Топор в озере',
  '77': 'Топорики',
  '80': 'Бабушка',
  '81': 'Бабка с клюшкой',
  '85': 'Перестройка',
  '88': 'Крендельки',
  '89': 'Дедушкин сосед',
  '90': 'Дедушка',
  '99': 'Шанс что не будет подруба',
}

export const VkColorsMap: { [key: number]: string } = {
  0: '#D66E34',
  1: '#B8AAFF',
  2: '#1D90FF',
  3: '#9961F9',
  4: '#59A840',
  5: '#E73629',
  6: '#DE6489',
  7: '#20BBA1',
  8: '#F8B301',
  9: '#0099BB',
  10: '#7BBEFF',
  11: '#E542FF',
  12: '#A36C59',
  13: '#8BA259',
  14: '#00A9FF',
  15: '#A20BFF',
}

export function isUserSubscriber(user: ChatUser) {
  const badges = user.vk_fields?.badges || []
  const subBadges = badges.filter(
    (badge) => badge.achievement.type === 'subscription'
  )
  return subBadges.length > 0
}
