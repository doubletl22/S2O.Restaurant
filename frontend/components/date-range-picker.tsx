"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { vi } from "date-fns/locale"; // Import tiếng Việt

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}

export function CalendarDateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  // State nội bộ nếu không truyền props (Uncontrolled mode)
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const selectedDate = date || internalDate;
  const setSelectedDate = (d: DateRange | undefined) => {
    setInternalDate(d);
    if (onDateChange) onDateChange(d);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, "dd/MM/yyyy")} -{" "}
                  {format(selectedDate.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(selectedDate.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Chọn khoảng thời gian</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={setSelectedDate}
            numberOfMonths={2}
            locale={vi} // Hiển thị lịch tiếng Việt
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}