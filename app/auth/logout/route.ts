import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('ログアウトエラー:', error)
    return NextResponse.json({ error: 'ログアウトに失敗しました' }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/login', request.url))
}