// ════════════════════════════════════════
//  Supabase DB 헬퍼
//  .env.local 에 아래 두 값을 설정하세요:
//    VITE_SUPABASE_URL=https://xxxx.supabase.co
//    VITE_SUPABASE_ANON_KEY=eyJxxx...
// ════════════════════════════════════════

const URL  = import.meta.env.VITE_SUPABASE_URL      || ''
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const TABLE = 'cms_content'

export const isConfigured = !!(URL && KEY && !URL.includes('YOUR_PROJECT'))

function hdrs(extra = {}) {
  return {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    ...extra
  }
}

/** DB에서 CMS 데이터 로드 */
export async function dbLoad() {
  if (!isConfigured) return null
  try {
    const res = await fetch(
      `${URL}/rest/v1/${TABLE}?id=eq.main&select=data`,
      { headers: hdrs() }
    )
    if (!res.ok) return null
    const rows = await res.json()
    return rows[0]?.data ?? null
  } catch {
    return null
  }
}

/** DB에 CMS 데이터 저장 (upsert) */
export async function dbSave(data) {
  if (!isConfigured) throw new Error('Supabase가 설정되지 않았습니다.')
  const res = await fetch(`${URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: hdrs({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ id: 'main', data, updated_at: new Date().toISOString() })
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DB 저장 실패: ${err}`)
  }
}
