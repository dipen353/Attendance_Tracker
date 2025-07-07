import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://dxwewezngrxwrevnfogk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4d2V3ZXpuZ3J4d3Jldm5mb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODYwODksImV4cCI6MjA2NzQ2MjA4OX0.U8tJi7U9c8A0Q0NyqQ8aioOnF3s2eD_KgfMQQ_srjkg'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
)