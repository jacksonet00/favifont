import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "cmdk";
import { ChevronsUpDown, Command, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Font } from "@/data";
import { useState } from "react";

interface ComboboxProps {
  fonts: Font[];
  value: number | null;
  onChange: (fontId: number) => void;
}

export default function Combobox({
  fonts,
  value,
  onChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value !== null
            ? fonts.find((font) => font.id === value)?.family
            : "Select fonts..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search fonts..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {fonts.map((font, idx) => (
                <CommandItem
                  key={font.id}
                  value={`${font.id}`}
                  onSelect={(currentValue) => {
                    onChange(parseInt(currentValue));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === font.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {font.family}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}