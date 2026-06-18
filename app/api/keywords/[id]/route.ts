import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: existing, error: fetchError } = await supabase
    .from('keywords')
    .select('id, is_active')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
  }

  const { data: updated, error: updateError } = await supabase
    .from('keywords')
    .update({ is_active: !existing.is_active })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update keyword' }, { status: 500 })
  }

  return NextResponse.json({ keyword: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: existing, error: fetchError } = await supabase
    .from('keywords')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('keywords')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete keyword' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
