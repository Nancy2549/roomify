interface AuthState {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
}
 type AuthContext = {
     isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
    refreshAuthState: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;
 }
