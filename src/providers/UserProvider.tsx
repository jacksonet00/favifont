import { FontUser } from "@/data";
import { errorWrapper, logWrapper } from "@/lib/utils";
import { getAnalytics, setUserId } from "firebase/analytics";
import { signOut as firebaseSignOut, User as FirebaseUser, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useQuery, useQueryClient } from "react-query";
import { auth, db, signInWithGoogleProvider } from "../../firebase.config";

const DEFAULT_DISPLAY_NAME = "anon";
const DEFAULT_PFP = "DEFAULT_PFP";

function genDefaultUserDocument(user: FirebaseUser): FontUser {
  return {
    uid: user.uid,
    displayName: user.displayName || DEFAULT_DISPLAY_NAME,
    email: user.email,
    phone: user.phoneNumber,
    displayImage: user.photoURL || DEFAULT_PFP,
    createdAt: serverTimestamp(),
    favoriteFonts: [],
    currentIndex: 0,
  };
}

async function fetchFontUser(firebaseUser: FirebaseUser | null): Promise<FontUser | null> {
  if (!firebaseUser) {
    return null;
  }
  const _doc = await getDoc(doc(db, "users", firebaseUser.uid));
  if (_doc.exists()) {
    return _doc.data() as FontUser;
  }
  else {
    return null;
  }
}

interface UserContextType {
  firebaseUser: FirebaseUser | null;
  user: FontUser | null;
  refetchUser: <TPageData>(options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined) => Promise<QueryObserverResult<FontUser | null, unknown>>;
  isUserLoading: boolean;
  isRefetchingUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode; }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setFirebaseUser);
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      logWrapper("Triggered sign in with google pop up.");
      const credential = await signInWithPopup(auth, signInWithGoogleProvider);
      const userId = credential.user.uid;
      logWrapper("Checking if user document exists in firestore...", credential.user);
      setUserId(getAnalytics(), userId);
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        logWrapper("user document does not exist, creating...");
        await setDoc(userDocRef, genDefaultUserDocument(credential.user));
        logWrapper("Created user document.");
      }
      refetchUser();
      router.push({ pathname: "/", query: {} });
    } catch (err) {
      errorWrapper(err);
    }
  };

  const signOut = async () => {
    try {
      router.push("/logout");
      setUserId(getAnalytics(), null);
      await firebaseSignOut(auth);
      queryClient.invalidateQueries("user");
      removeUser();
    } catch (err) {
      errorWrapper(err);
    }
  };

  const {
    data: user,
    isLoading: isUserLoading,
    isRefetching: isRefetchingUser,
    refetch: refetchUser,
    remove: removeUser,
  } = useQuery({
    queryKey: "user",
    queryFn: () => fetchFontUser(firebaseUser),
    enabled: !!firebaseUser,
  });

  const value = {
    firebaseUser,
    user: user ?? null,
    refetchUser,
    isUserLoading,
    isRefetchingUser,
    signInWithGoogle,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}