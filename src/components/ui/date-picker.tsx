"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  className,
}: {
  value: Date | null;
  onChange: (value: Date | null) => void;
  className?: string;
}) {
  const [date, setDate] = React.useState<Date | null>(value);

  React.useEffect(() => {
    onChange(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal",
            className,
          )}
        >
          <CalendarIcon />
          {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date ?? new Date()}
          onSelect={(date) => setDate(date || null)}
        />
      </PopoverContent>
    </Popover>
  );
}
