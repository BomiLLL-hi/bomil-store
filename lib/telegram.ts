const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const MANAGER_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

export async function sendToManager(text: string): Promise<number | null> {
  if (!BOT_TOKEN || !MANAGER_CHAT_ID) return null
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: MANAGER_CHAT_ID, text, parse_mode: 'HTML' }),
    })
    const data = await res.json()
    return data.ok ? data.result.message_id : null
  } catch {
    return null
  }
}

export async function replyToManager(chatId: number, text: string): Promise<void> {
  if (!BOT_TOKEN) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
  } catch {}
}
