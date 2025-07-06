"use client"

import * as React from "react"
import { addDays, format } from "date-fns"

import { cn } from "../lib/utils"
import { Calendar } from "./ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

export default function DatePickerSingle({
  className,
  value,
  onChange,
}) {
  const [internalDate, setInternalDate] = React.useState(new Date(2022, 0, 20));

  React.useEffect(() => {
    if (value) {
      setInternalDate(typeof value === 'string' ? new Date(value) : value);
    }
  }, [value]);

  const handleSelect = (date) => {
    setInternalDate(date);
    if (onChange) {
      onChange(date ? format(date, 'yyyy-MM-dd') : '');
    }
  };

  const currentDate = value ? (typeof value === 'string' ? new Date(value) : value) : internalDate;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "btn px-2.5 min-w-[12rem] bg-white border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 dark:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium text-left justify-start",
              !currentDate && "text-muted-foreground"
            )}
          >
            <svg className="fill-current text-gray-400 dark:text-gray-500 ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16">
              <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"></path>
              <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z"></path>
            </svg>
            {currentDate ? (
              format(currentDate, "LLL dd, y")
            ) : (
              <span>Pilih tanggal</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={currentDate}
            selected={currentDate}
            onSelect={handleSelect}
          />
          <div className="flex justify-between px-4 py-2 border-t bg-white dark:bg-gray-800 text-sm">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => {
                setInternalDate(null);
                if (onChange) onChange('');
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => {
                const today = new Date();
                setInternalDate(today);
                if (onChange) onChange(format(today, 'yyyy-MM-dd'));
              }}
            >
              Today
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
