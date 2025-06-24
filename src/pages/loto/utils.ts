import { sample, sampleSize, shuffle, uniq } from 'lodash'
import { ChatUser } from '@/pages/turnir/api'
import { SuperGameResultItem, Ticket, TicketId } from './types'
import { ChatConnection, ChatServerType } from '../turnir/types'
import { VkRewards } from './ConfigurationButton'

type Props = {
  ownerId: string
  ownerName: string
  drawOptions: string[]
  type: 'chat' | 'points'
  text?: string
  source: ChatConnection
  created_at: number
  isLatecomer: boolean
}

export function genTicket({
  ownerId,
  ownerName,
  drawOptions,
  source,
  text,
  type,
  created_at,
  isLatecomer,
}: Props): Ticket {
  const value = genTicketNumber(drawOptions, text)
  return {
    id: Math.random().toString(36).substring(2, 9) as TicketId,
    owner_id: ownerId,
    owner_name: ownerName,
    value,
    color: randomTicketColor(),
    variant: sample([0, 1, 2, 3, 4, 5, 6, 7]),
    source,
    type,
    created_at,
    isLatecomer,
  }
}

export function randomTicketColor(target?: number) {
  const colors = [
    '#634f5f', // dark red
    '#654b3c', // brown
    '#4a4857', // greyish
    '#0c5159', // dark green
  ]

  if (target !== undefined) {
    return colors[target % colors.length]
  }

  return sample(colors) as string
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
      .filter((n) => drawOptions.includes(n))
  )

  if (ticket.length < 8) {
    // add non-matching draw options
    const sampleOptions = sampleSize(drawOptions, 10)
    const validOptions = sampleOptions.filter((o) => !ticket.includes(o))
    ticket.push(...sampleSize(validOptions, 8 - ticket.length))
  }

  // limit to first 8 items
  return ticket.slice(0, 8)
}

export const NumberToFancyName: { [k: string]: string } = {
  '01': 'Кол',
  '02': 'Гусь',
  '03': 'На троих',
  '04': 'Стул',
  '05': 'Дагестан',
  '06': 'Ингушетия',
  '07': 'Топор',
  '08': 'Кольца',
  '09': 'Карачаево-Черкессия',
  '10': 'Часовой',
  '11': 'Барабанные палочки',
  '12': 'Дюжина',
  '13': 'Чертова дюжина',
  '14': 'Саха (Якутия)',
  '15': 'Северная Осетия',
  '16': 'Татарстан',
  '17': 'Тыва',
  '18': 'Удмуртия',
  '19': 'Хакасия',
  '20': 'Лебединое озеро',
  '21': 'Очко',
  '22': 'Два гуся',
  '23': 'Два притопа, три прихлопа',
  '24': 'Лебедь на стуле',
  '25': 'Опять двадцать пять',
  '26': 'Ставрополь',
  '27': 'Клуб 27',
  '28': 'Амурская область',
  '29': 'Архангельск',
  '30': 'Астрахань',
  '31': 'Белгород',
  '32': 'Брянск',
  '33': 'Кудри',
  '34': 'Волгоград',
  '35': 'Вологда',
  '36': 'Воронеж',
  '37': 'Иваново',
  '38': '38 попугаев',
  '39': 'Калининград',
  '40': 'Калуга',
  '41': 'Ем один',
  '42': 'Главный вопрос жизни, Вселенной и вообще',
  '43': 'Сталинград',
  '44': 'Стульчики',
  '45': 'Баба ягодка опять',
  '46': 'Курск',
  '47': 'Баба ягодка совсем',
  '48': 'Половинку просим',
  '49': 'Магадан',
  '50': 'Полста',
  '51': 'Великолепная пятерка и вратарь',
  '52': 'Нижний Новгород',
  '53': 'Великий Новгород',
  '54': 'Новосибирск',
  '55': 'Омск',
  '56': 'Оренбург',
  '57': 'Орел',
  '58': 'Пенза',
  '59': 'Пермь',
  '60': 'Псков',
  '61': 'Ростов',
  '62': 'Рязань',
  '63': 'Терешкова',
  '64': 'Саратов',
  '65': 'Сахалин',
  '66': 'Валенки',
  '67': 'Смоленск',
  '68': 'Тамбов',
  '69': 'MHMM',
  '70': 'Топор в озере',
  '71': 'Тула',
  '72': 'Тюмень',
  '73': 'Ульяновск',
  '74': 'Челябинск',
  '75': 'Забайкалье',
  '76': 'Ярославль',
  '77': 'Топорики',
  '78': 'Санкт-Петербург',
  '79': 'Еврейская автономная область',
  '80': 'Бабушка',
  '81': 'Бабка с клюшкой',
  '82': 'Чукотка',
  '83': 'Ненецкий автономный округ',
  '84': 'Крым',
  '85': 'Перестройка',
  '86': 'Ханты-Мансийск - Югра',
  '87': 'Чукотка',
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

export function hexToRgb(hex: string): [number, number, number] {
  // Remove the '#' if present
  hex = hex.replace(/^#/, '')

  // Parse the string and convert to decimal values
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return [r, g, b]
}

export function isBrightColor(hexColor: string): boolean {
  const [r, g, b] = hexToRgb(hexColor)

  // Convert RGB to the 0-1 range
  let rNorm = r / 255
  let gNorm = g / 255
  let bNorm = b / 255

  // Apply gamma correction
  rNorm =
    rNorm <= 0.03928 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4)
  gNorm =
    gNorm <= 0.03928 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4)
  bNorm =
    bNorm <= 0.03928 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4)

  // Calculate luminance
  const luminance = 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm

  // console.log(hexColor, luminance)

  return luminance > 0.1
}

export function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}м ${remainingSeconds.toString().padStart(2, '0')}с`
}

export function formatSecondsZero(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

type GenerateParams = {
  amount: number
  smallPrizes: number
  mediumPrizes: number
  bigPrizes: number
  customPrizes?: VkRewards
}

export function generateSuperGameValues({
  amount,
  smallPrizes,
  mediumPrizes,
  bigPrizes,
  customPrizes,
}: GenerateParams) {
  const result: SuperGameResultItem[] = []
  // insert small prizes
  for (let i = 0; i < smallPrizes; i++) {
    result.push('x1')
  }
  // insert medium prizes
  for (let i = 0; i < mediumPrizes; i++) {
    result.push('x2')
  }
  // insert big prizes
  for (let i = 0; i < bigPrizes; i++) {
    result.push('x3')
  }
  // insert custom prizes
  if (customPrizes) {
    for (const [streamKey, value] of Object.entries(customPrizes)) {
      for (const [prizeKey, count] of Object.entries(value)) {
        for (let i = 0; i < count; i++) {
          result.push(prizeKey)
        }
      }
    }
  }

  // fill the rest with empty values
  const filledFields = result.length
  for (let i = 0; i < amount - filledFields; i++) {
    result.push('empty')
  }
  return shuffle(Array.from(result))
}

export function formatUnixToDate(unix: number) {
  const date = new Date(unix * 1000)
  // only show localised month and day
  return date.toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatMsToTime(ms: number) {
  const date = new Date(ms)
  const millis = String(date.getMilliseconds()).padStart(3, '0')

  // only show localised month, day and time
  const time = date.toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return `${time}.${millis}`
}

export const ServerIcons: { [k in ChatServerType]: string } = {
  twitch: 'https://cdn-icons-png.flaticon.com/512/3992/3992643.png',
  vkvideo: 'https://vkvideo.ru/images/icons/favicons/fav_vk_video_2x.ico?8',
  kick: 'https://kick.com/favicon.ico',
  goodgame: 'https://static.goodgame.ru/images/favicon/favicon-32x32.png',
  nuum: 'https://cdn-icons-png.flaticon.com/512/7261/7261483.png',
  youtube:
    'https://www.youtube.com/s/desktop/e1590144/img/logos/favicon_32x32.png',
}
