import { Font } from "@/data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { MdCompareArrows, MdArrowBackIosNew, MdDeleteForever } from "react-icons/md";
import { useFontLoader } from "./FaviFont";

type FontCardType = "SWIPE" | "COMPARE" | "FAVORITE";

interface FontCardProps {
  font: Font;
  previewText: string;
  type?: FontCardType;
  onPrev?: (index: number) => void;
  onNext?: (index: number) => void;
  onCompare?: (index: number) => void;
  onDelete?: (index: number) => void;
  disabled?: boolean;
  compareEnabled?: boolean;
}

function getFontSize(previewText: string) {
  if (previewText.length > 100) {
    return "text-sm";
  }
  if (previewText.length > 50) {
    return "text-xl";
  }
  if (previewText.length > 20) {
    return "text-2xl";
  }
  return "text-3xl";
}

function FontCard({
  font,
  previewText,
  type = "SWIPE",
  onPrev = () => { },
  onNext = () => { },
  onCompare = () => { },
  onDelete = () => { },
  disabled = false,
  compareEnabled = false,
}: FontCardProps) {
  useFontLoader(font.id, type === "COMPARE");

  if (type === "FAVORITE") {
    return (
      <Card className="w-96 h-32">
        <CardHeader className="flex-row h-full">
          <div className="flex flex-col w-11/12 h-full">
            <CardTitle><h1
              style={{ fontFamily: font.family }}
              className={`${getFontSize(previewText)} w-full max-h-12 overflow-hidden`}
            >
              {previewText.length ? previewText : font.family}
            </h1></CardTitle>
            <CardDescription><a
              target="_blank"
              href={`https://fonts.google.com/specimen/${font.family}`}
            >
              <h3 className="underline underline-offset-2 hover:text-blue-600">{font.family} ➚</h3>
            </a></CardDescription>
          </div>
          <div className="flex space-x-4 h-full">
            <Button
              size="icon"
              className="mt-auto"
              onClick={() => onDelete(font.id)}
              disabled={disabled}
            >
              <MdDeleteForever />
            </Button>
            <Button
              size="icon"
              className={`mt-auto ${compareEnabled ? "" : "hidden"}`}
              onClick={() => onCompare(font.id)}
              disabled={disabled}
            >
              <MdCompareArrows />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-96 h-56">
      <CardHeader>
        <CardTitle>
          <a
            target="_blank"
            href={`https://fonts.google.com/specimen/${font.family}`}
          >
            <h3 className="underline underline-offset-2 hover:text-blue-600">{font.family} ➚</h3>
          </a>
        </CardTitle>
        <CardDescription><p>{font.category}</p></CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <h1
          style={{ fontFamily: font.family }}
          className={`${getFontSize(previewText)} text-center w-full max-h-12 overflow-hidden`}
        >
          {previewText.length ? previewText : font.family}
        </h1>
      </CardContent>
      {type === "COMPARE" &&
        <CardFooter>
          <Button
            size="icon"
            className="mr-auto"
            onClick={() => onPrev(font.id)}
            disabled={disabled}
          >
            <MdArrowBackIosNew />
          </Button>
          <Button
            size="icon"
            className="ml-auto"
            onClick={() => onNext(font.id)}
            disabled={disabled}
          >
            <MdArrowBackIosNew style={{ transform: 'rotate(180deg)' }} />
          </Button>
        </CardFooter>
      }
    </Card>
  );
}

export default FontCard;