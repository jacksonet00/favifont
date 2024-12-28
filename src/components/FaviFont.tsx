import { FamilyMetadata, Font, FontUser, GoogleFontsAPIResponse } from "@/data";
import * as fontMetadata from "@/data/fonts_metadata.json";
import { useUser } from "@/providers/UserProvider";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaThumbsDown } from "react-icons/fa6";
import { useMutation, useQueryClient } from "react-query";
import { db } from "../../firebase.config";
import AuthModal from "./AuthModal";
import FontCard from "./FontCard";
import Footer from "./Footer";
import GAuthButton from "./GAuthButton";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";

const GOOGLE_FONTS: Font[] = (fontMetadata as GoogleFontsAPIResponse).familyMetadataList.map((data: FamilyMetadata, idx: number) => ({
  family: data.family,
  category: data.category,
  variants: ["regular"],
  id: idx,
}));

const PREFETCH_COUNT = 5;
export const useFontLoader = (currentIndex: number, enabled = true) => {
  if (!enabled) {
    return;
  }
  useEffect(() => {
    if (!enabled) {
      return;
    }
    import('webfontloader').then(WebFont => {
      const fontsToLoad = GOOGLE_FONTS.slice(currentIndex, currentIndex + PREFETCH_COUNT)
        .map(f => f.family);

      if (fontsToLoad.length === 0) return;

      const cachedFonts = JSON.parse(localStorage.getItem('cachedFonts') || '[]');
      const uncachedFonts = fontsToLoad.filter(f => !cachedFonts.includes(f));

      if (uncachedFonts.length > 0) {
        WebFont.load({
          google: {
            families: uncachedFonts,
            // text: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
          },
          active: () => {
            localStorage.setItem('cachedFonts',
              JSON.stringify([...cachedFonts, ...uncachedFonts]));
          }
        });
      }
    });
  }, [currentIndex]);
};

async function updateUser(uid: string, partialUser: Partial<FontUser>) {
  await setDoc(doc(db, "users", uid), partialUser, { merge: true });
}

function FaviFont() {
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { user, firebaseUser } = useUser();

  const [currentIndex, setCurrentIndex] = useState(user ? user.currentIndex : 0);
  const [favorites, setFavorites] = useState(user ? user.favoriteFonts : []);

  const [previewText, setPreviewText] = useState(router.query.previewText ? router.query.previewText as string : "FaviFont");
  const [currentFont, setCurrentFont] = useState(GOOGLE_FONTS[currentIndex]);

  const [fontA, setFontA] = useState<Font>(GOOGLE_FONTS[0]);
  const [fontB, setFontB] = useState<Font>(GOOGLE_FONTS[0]);

  useEffect(() => {
    localStorage.removeItem("cachedFonts");
  }, []);

  useEffect(() => {
    if (user) {
      setCurrentIndex(user.currentIndex);
      setCurrentFont(GOOGLE_FONTS[user.currentIndex]);
      setFavorites(user.favoriteFonts);
    }
  }, [user]);

  useEffect(() => {
    if (router.query.compare && router.query.compareTo) {
      setFontA(GOOGLE_FONTS[parseInt(router.query.compare as string)]);
      setFontB(GOOGLE_FONTS[parseInt(router.query.compareTo as string)]);
    }
    if (router.query.previewText) {
      setPreviewText(router.query.previewText as string);
    }
  }, [router.query]);

  useFontLoader(currentIndex);

  const { mutate } = useMutation({
    mutationFn: (partialUser: Partial<FontUser>) => updateUser(firebaseUser!.uid, partialUser),
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "user" });
    }
  });

  function handleDelete(index: number) {
    mutate({
      favoriteFonts: user!.favoriteFonts.filter((font) => font.id !== index),
    });
  }

  function getPrevFavorite(favId: number): Font {
    const fav = favorites.find((font) => font.id === favId);
    const favIndex = favorites.indexOf(fav!);
    const prevFavoriteId = favorites[(favIndex - 1 + favorites.length) % favorites.length].id;
    return GOOGLE_FONTS[prevFavoriteId];
  }

  function getNextFavorite(favId: number): Font {
    const fav = favorites.find((font) => font.id === favId);
    const favIndex = favorites.indexOf(fav!);
    const nextFavoriteId = favorites[(favIndex + 1) % favorites.length].id;
    return GOOGLE_FONTS[nextFavoriteId];
  }

  function handleCompare(fontAId: number) {
    const fontA = favorites.find((font) => font.id === fontAId);
    if (!fontA) {
      router.push({ query: {} });
      return;
    }
    const fontAFavoriteIndex = favorites.indexOf(fontA!);
    const fontBId = favorites[(fontAFavoriteIndex! + 1) % favorites.length].id;
    setFontA(GOOGLE_FONTS[fontAId]);
    setFontB(GOOGLE_FONTS[fontBId]);
    router.push({ query: { compare: fontAId, compareTo: fontBId, previewText, } });
  }

  function handleExit() {
    router.push({ query: {} });
  }

  const FavoritesList = useMemo(() => (
    <div className="flex flex-col w-96 space-y-4">
      {favorites.map((favorite) => (
        <FontCard
          font={favorite}
          previewText={previewText}
          type="FAVORITE"
          onDelete={handleDelete}
          onCompare={handleCompare}
          disabled={loading}
          compareEnabled={favorites.length > 1}
        />
      ))}
    </div>
  ), [favorites, previewText]);

  type Rating = "SAVE" | "SKIP";
  const handleRating = (rating: Rating) => {
    if (rating === 'SAVE') {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      mutate({
        currentIndex: (currentIndex + 1) % GOOGLE_FONTS.length,
        favoriteFonts: [...favorites, currentFont],
      });
      setFavorites([...favorites, currentFont]);
    };
    setCurrentFont(GOOGLE_FONTS[(currentIndex + 1) % GOOGLE_FONTS.length]);
    setCurrentIndex(prev => (prev + 1) % GOOGLE_FONTS.length);
  };

  function handleOpen() {
    if (!user) {
      setAuthModalOpen(true);
    }
  }

  const { compare } = router.query;

  if (compare) {
    return (
      <>
        <main className="flex flex-col mt-10 items-center space-y-4 mb-80">
          <AuthModal open={!user && authModalOpen} onClose={() => setAuthModalOpen(false)} />
          <div className="flex w-96 items-center">
            <h1 className="text-xl font-bold mr-auto">Compare</h1>
            <Button className="ml-auto" onClick={handleExit}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                  clipRule="evenodd"
                />
              </svg>
              Exit
            </Button>
          </div>
          <Select onOpenChange={handleOpen} value={`${fontA.id}`} onValueChange={(e) => {
            setFontA(GOOGLE_FONTS[parseInt(e)]);
            const params = new URLSearchParams(window.location.search);
            params.set('compare', e);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({}, '', newUrl);
          }}>
            <SelectTrigger className="w-96">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fonts</SelectLabel>
                {favorites.map((font) => (
                  <SelectItem value={`${font.id}`}>{font.family}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FontCard
            font={fontA}
            previewText={previewText}
            type="COMPARE"
            onNext={(id) => setFontA(getNextFavorite(id))}
            onPrev={(id) => setFontA(getPrevFavorite(id))}
          />
          <Select onOpenChange={handleOpen} value={`${fontB.id}`} onValueChange={(e) => {
            setFontB(GOOGLE_FONTS[parseInt(e)]);
            const params = new URLSearchParams(window.location.search);
            params.set('compareTo', e);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({}, '', newUrl);
          }}>
            <SelectTrigger className="w-96">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fonts</SelectLabel>
                {favorites.map((font) => (
                  <SelectItem value={`${font.id}`}>{font.family}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FontCard
            font={fontB}
            previewText={previewText}
            type="COMPARE"
            onNext={(id) => setFontB(getNextFavorite(id))}
            onPrev={(id) => setFontB(getPrevFavorite(id))}
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="flex flex-col mt-10 items-center space-y-4 mb-80">
        <AuthModal open={!user && authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <Input
          className="w-96"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
        />
        <FontCard
          font={currentFont}
          previewText={previewText}
        />
        <div className="flex w-96 justify-between">
          <Button className="w-32" onClick={() => handleRating("SKIP")} disabled={loading}>
            <FaThumbsDown /> Skip
          </Button>
          <Button className="w-32" onClick={() => handleRating("SAVE")} disabled={loading}>
            <FaHeart /> Save
          </Button>
        </div>
        <div className="flex flex-col w-96 space-y-4">
          <h1 className="text-xl font-bold">Favorites</h1>
          {!user &&
            <div className="flex w-96 justify-center">
              <GAuthButton />
            </div>
          }
          {user && !favorites.length && <p className="text-muted-foreground">No fonts saved.</p>}
          {FavoritesList}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default FaviFont;