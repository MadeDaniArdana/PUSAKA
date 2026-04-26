import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://gzocqquxnrvifgzgjamq.supabase.co',
  'sb_publishable_z4anT05Ik6pOzeA_AANXzA_8bFRBHdm'
)

async function createAdmin() {
  const email = 'admin.griyasync@gmail.com'
  const password = 'Admin@GriyaSync2024'

  console.log(`Mencoba membuat akun admin: ${email}...`)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Administrator',
        role: 'admin'
      }
    }
  })

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('Akun sudah terdaftar! Tidak perlu dibuat ulang.')
    } else {
      console.error('Error saat membuat akun:', error.message)
    }
  } else {
    console.log('Berhasil! Akun admin telah dibuat.')
    console.log('Data:', data.user?.id)
  }
}

createAdmin()
