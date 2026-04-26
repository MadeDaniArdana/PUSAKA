'use client';

import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { isAdmin } from '@/lib/admin';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAdminUser: boolean;
  loading: boolean;
}

export function useAuth(): AuthState {
  const supabase = createClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdminUser: false,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isAdminUser: isAdmin(session?.user),
        loading: false,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          isAdminUser: isAdmin(session?.user),
          loading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
