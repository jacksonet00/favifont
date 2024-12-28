import { FamilyMetadata, Font, FontUser, GoogleFontsAPIResponse } from "@/data";
import * as fontMetadata from "@/data/fonts_metadata.json";
import { useUser } from "@/providers/UserProvider";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { useVirtualizer } from "@tanstack/react-virtual";

const GOOGLE_FONTS: Font[] = (fontMetadata as GoogleFontsAPIResponse).familyMetadataList.map(
  (data: FamilyMetadata, idx: number) => ({
    family: data.family,
    category: data.category,
    variants: ["regular"],
    id: idx,
  })
);

const PREFETCH_COUNT = 5;
export const useFontLoader = (currentIndex: number, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    import("webfontloader").then((WebFont) => {
      const fontsToLoad = GOOGLE_FONTS.slice(currentIndex, currentIndex + PREFETCH_COUNT).map(
        (f) => f.family
      );
      if (fontsToLoad.length === 0) return;
      const cachedFonts = JSON.parse(localStorage.getItem("cachedFonts") || "[]");
      const uncachedFonts = fontsToLoad.filter((f) => !cachedFonts.includes(f));
      if (uncachedFonts.length > 0) {
        WebFont.load({
          google: { families: uncachedFonts },
          active: () => {
            localStorage.setItem(
              "cachedFonts",
              JSON.stringify([...cachedFonts, ...uncachedFonts])
            );
          },
        });
      }
    });
  }, [currentIndex, enabled]);
};

function useFonts(fonts: Font[]) {
  useEffect(() => {
    import("webfontloader").then((WebFont) => {
      const fontsToLoad = fonts.map((f) => f.family);
      if (fontsToLoad.length === 0) return;
      const cachedFonts = JSON.parse(localStorage.getItem("cachedFonts") || "[]");
      const uncachedFonts = fontsToLoad.filter((f) => !cachedFonts.includes(f));
      if (uncachedFonts.length > 0) {
        WebFont.load({
          google: { families: uncachedFonts },
          active: () => {
            localStorage.setItem(
              "cachedFonts",
              JSON.stringify([...cachedFonts, ...uncachedFonts])
            );
          },
        });
      }
    });
  }, [fonts]);
}

async function updateUser(uid: string, partialUser: Partial<FontUser>) {
  await setDoc(doc(db, "users", uid), partialUser, { merge: true });
}

type CompareMode = "FAVORITES" | "ALL";

function VirtualizedFontSelectItems({
  items,
  open,
  selectedValue,
}: {
  items: Font[];
  open: boolean;
  selectedValue: string;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  useEffect(() => {
    if (!open) return;
    if (!selectedValue) return;
    const selectedIndex = items.findIndex((font) => String(font.id) === selectedValue);
    if (selectedIndex >= 0) {
      rowVirtualizer.scrollToIndex(selectedIndex, { align: "center" });
    }
  }, [open, selectedValue, items, rowVirtualizer]);
  return (
    <div ref={parentRef} style={{ overflowY: "auto", maxHeight: "300px" }}>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const font = items[virtualRow.index];
          return (
            <SelectItem
              key={font.id}
              value={`${font.id}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {font.family}
            </SelectItem>
          );
        })}
      </div>
    </div>
  );
}

function FaviFont() {
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, firebaseUser } = useUser();
  const [currentIndex, setCurrentIndex] = useState(user ? user.currentIndex : 0);
  const [favorites, setFavorites] = useState(user ? user.favoriteFonts : []);
  const [previewText, setPreviewText] = useState(
    router.query.previewText ? (router.query.previewText as string) : "FaviFont"
  );
  const [currentFont, setCurrentFont] = useState(GOOGLE_FONTS[currentIndex]);
  const [compareMode, setCompareMode] = useState<CompareMode>("ALL");
  const [fontA, setFontA] = useState<Font>(GOOGLE_FONTS[0]);
  const [fontB, setFontB] = useState<Font>(GOOGLE_FONTS[0]);
  const [isFontAPickerOpen, setFontAPickerOpen] = useState(false);
  const [isFontBPickerOpen, setFontBPickerOpen] = useState(false);
  const [isCurrentFontPickerOpen, setCurrentFontPickerOpen] = useState(false);

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
      const fontAId = parseInt(router.query.compare as string);
      const fontBId = parseInt(router.query.compareTo as string);

      if (fontAId < 0 || fontAId >= GOOGLE_FONTS.length || fontBId < 0 || fontBId >= GOOGLE_FONTS.length) {
        router.push({ query: { previewText: router.query.previewText } });
        return;
      }

      setFontA(GOOGLE_FONTS[fontAId]);
      setFontB(GOOGLE_FONTS[fontBId]);

      if (!favorites.length) {
        return;
      }
      if (!favorites.find((font) => font.id === fontAId) || !favorites.find((font) => font.id === fontBId)) {
        setCompareMode("ALL");
      }
      else {
        setCompareMode("FAVORITES");
      }
    }
  }, [favorites, router.query.compare, router.query.compareTo]);

  useEffect(() => {
    if (router.query.previewText) {
      setPreviewText(router.query.previewText as string);
    }
  }, [router.query.previewText]);

  useFontLoader(currentIndex);
  useFonts(favorites);
  useFonts([fontA, fontB]);

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
    },
  });

  function handleDelete(index: number) {
    mutate({
      favoriteFonts: user!.favoriteFonts.filter((font) => font.id !== index),
    });
  }

  function getPreviousFont(id: number, mode: CompareMode) {
    if (mode === "ALL") {
      const prevIndex = (id - 1 + GOOGLE_FONTS.length) % GOOGLE_FONTS.length;
      return GOOGLE_FONTS[prevIndex];
    } else {
      const fav = favorites.find((f) => f.id === id);
      const favIndex = favorites.indexOf(fav!);
      const prevFavoriteId = favorites[(favIndex - 1 + favorites.length) % favorites.length].id;
      return GOOGLE_FONTS[prevFavoriteId];
    }
  }

  function getNextFont(id: number, mode: CompareMode) {
    if (mode === "ALL") {
      const nextIndex = (id + 1) % GOOGLE_FONTS.length;
      return GOOGLE_FONTS[nextIndex];
    } else {
      const fav = favorites.find((f) => f.id === id);
      const favIndex = favorites.indexOf(fav!);
      const nextFavoriteId = favorites[(favIndex + 1) % favorites.length].id;
      return GOOGLE_FONTS[nextFavoriteId];
    }
  }

  function handleCompare(fontAId: number) {
    const fontAItem = favorites.find((font) => font.id === fontAId);
    if (!fontAItem) {
      router.push({ query: {} });
      return;
    }
    const fontAFavoriteIndex = favorites.indexOf(fontAItem);
    const fontBId = favorites[(fontAFavoriteIndex + 1) % favorites.length].id;
    setFontA(GOOGLE_FONTS[fontAId]);
    setFontB(GOOGLE_FONTS[fontBId]);
    router.push({
      query: { compare: fontAId, compareTo: fontBId, previewText },
    });
  }

  function handleExit() {
    router.push({ query: {} });
  }

  const FavoritesList = useMemo(
    () => (
      <div className="flex flex-col w-96 space-y-4">
        {favorites.map((favorite) => (
          <FontCard
            key={favorite.id}
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
    ),
    [favorites, previewText, loading]
  );

  type Rating = "SAVE" | "SKIP";
  const handleRating = (rating: Rating) => {
    if (rating === "SAVE") {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      mutate({
        currentIndex: (currentIndex + 1) % GOOGLE_FONTS.length,
        favoriteFonts: [...favorites, currentFont],
      });
      setFavorites([...favorites, currentFont]);
    }
    setCurrentFont(GOOGLE_FONTS[(currentIndex + 1) % GOOGLE_FONTS.length]);
    setCurrentIndex((prev) => (prev + 1) % GOOGLE_FONTS.length);
  };

  function setUrlParam(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
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
          <Tabs
            value={compareMode.toLowerCase()}
            onValueChange={(v) => {
              if (v === "favorites" && !user) {
                setAuthModalOpen(true);
                return;
              }
              setCompareMode((v as "favorites" | "all").toUpperCase() as CompareMode);
            }}
            className="w-96"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="all">All Fonts</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="grid w-96 items-center gap-1.5">
            <Label htmlFor="preview-text">Preview Text</Label>
            <Input
              id="preview-text"
              placeholder="FaviFont"
              value={previewText}
              onChange={(e) => {
                setPreviewText(e.target.value);
                setUrlParam("previewText", e.target.value);
              }}
            />
          </div>
          <Select
            onOpenChange={(open) => {
              setFontAPickerOpen(open);
            }}
            value={`${fontA.id}`}
            onValueChange={(val) => {
              setFontA(GOOGLE_FONTS[parseInt(val)]);
              setUrlParam("compare", val);
            }}
          >
            <div className="grid w-96 items-center gap-1.5">
              <Label htmlFor="font-a-picker">Font #1</Label>
              <SelectTrigger id="font-a-picker">
                <SelectValue>
                  {GOOGLE_FONTS.find((f) => f.id === fontA.id)?.family || "Select a font"}
                </SelectValue>
              </SelectTrigger>
            </div>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fonts</SelectLabel>
                {compareMode === "FAVORITES" ? (
                  <VirtualizedFontSelectItems
                    items={favorites}
                    open={isFontAPickerOpen}
                    selectedValue={`${fontA.id}`}
                  />
                ) : (
                  <VirtualizedFontSelectItems
                    items={GOOGLE_FONTS}
                    open={isFontAPickerOpen}
                    selectedValue={`${fontA.id}`}
                  />
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FontCard
            font={fontA}
            previewText={previewText}
            type="COMPARE"
            onNext={(id) => setFontA(getNextFont(id, compareMode))}
            onPrev={(id) => setFontA(getPreviousFont(id, compareMode))}
          />
          <Select
            onOpenChange={(open) => {
              setFontBPickerOpen(open);
            }}
            value={`${fontB.id}`}
            onValueChange={(val) => {
              setFontB(GOOGLE_FONTS[parseInt(val)]);
              setUrlParam("compareTo", val);
            }}
          >
            <div className="grid w-96 items-center gap-1.5">
              <Label htmlFor="font-b-picker">Font #2</Label>
              <SelectTrigger id="font-b-picker">
                <SelectValue>
                  {GOOGLE_FONTS.find((f) => f.id === fontB.id)?.family || "Select a font"}
                </SelectValue>
              </SelectTrigger>
            </div>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fonts</SelectLabel>
                {compareMode === "FAVORITES" ? (
                  <VirtualizedFontSelectItems
                    items={favorites}
                    open={isFontBPickerOpen}
                    selectedValue={`${fontB.id}`}
                  />
                ) : (
                  <VirtualizedFontSelectItems
                    items={GOOGLE_FONTS}
                    open={isFontBPickerOpen}
                    selectedValue={`${fontB.id}`}
                  />
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FontCard
            font={fontB}
            previewText={previewText}
            type="COMPARE"
            onNext={(id) => setFontB(getNextFont(id, compareMode))}
            onPrev={(id) => setFontB(getPreviousFont(id, compareMode))}
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
        <div className="flex w-96 items-center">
          <h1 className="text-xl font-bold mr-auto">Explore</h1>
        </div>
        <div className="grid w-96 items-center gap-1.5">
          <Label htmlFor="preview-text">Preview Text</Label>
          <Input
            id="preview-text"
            placeholder="FaviFont"
            value={previewText}
            onChange={(e) => {
              setPreviewText(e.target.value);
              setUrlParam("previewText", e.target.value);
            }}
          />
        </div>
        <Select
          onOpenChange={(open) => {
            setCurrentFontPickerOpen(open);
          }}
          value={`${currentFont.id}`}
          onValueChange={(val) => {
            setCurrentFont(GOOGLE_FONTS[parseInt(val)]);
            setCurrentIndex(parseInt(val));
          }}
        >
          <div className="grid w-96 items-center gap-1.5">
            <Label htmlFor="font-picker">Current Font</Label>
            <SelectTrigger id="font-picker">
              <SelectValue>
                {GOOGLE_FONTS.find((f) => f.id === currentFont.id)?.family || "Select a font"}
              </SelectValue>
            </SelectTrigger>
          </div>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fonts</SelectLabel>
              <VirtualizedFontSelectItems
                items={GOOGLE_FONTS}
                open={isCurrentFontPickerOpen}
                selectedValue={`${currentFont.id}`}
              />
            </SelectGroup>
          </SelectContent>
        </Select>
        <FontCard font={currentFont} previewText={previewText} />
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
          {!user && (
            <div className="flex w-96 justify-center">
              <GAuthButton />
            </div>
          )}
          {user && !favorites.length && <p className="text-muted-foreground">No fonts saved.</p>}
          {FavoritesList}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default FaviFont;
