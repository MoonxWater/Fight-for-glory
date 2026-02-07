// Mock Supabase to work in this environment using LocalStorage
// This replaces the real createClient call to ensure the app works out-of-the-box
export const supabase = {
  auth: {
    getSession: async () => {
      const user = localStorage.getItem('glory_admin_user');
      return { data: { session: user ? { user: JSON.parse(user) } : null } };
    },
    signInWithOAuth: async ({ provider }: any) => {
      const mockUser = { 
        email: 'admin@macet.ac.in', 
        user_metadata: { 
          full_name: 'MACET Admin', 
          avatar_url: 'https://ui-avatars.com/api/?name=MACET+Admin&background=e11d48&color=fff' 
        } 
      };
      localStorage.setItem('glory_admin_user', JSON.stringify(mockUser));
      window.location.reload();
      return { error: null };
    },
    signOut: async () => {
      localStorage.removeItem('glory_admin_user');
      window.location.reload();
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};