"use client"

import * as React from "react"
import { addDays, format, isAfter, isBefore, isSameDay, startOfDay } from "date-fns"
import { id } from "date-fns/locale"

import { cn } from "../lib/utils"
import { Calendar } from "./ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

export default function DateRangePicker({
  className,
  value,
  onChange,
  placeholder = "Pilih rentang tanggal"
}) {
  const [dateRange, setDateRange] = React.useState({
    from: value?.from ? new Date(value.from) : null,
    to: value?.to ? new Date(value.to) : null,
  });
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      setDateRange({
        from: value.from ? new Date(value.from) : null,
        to: value.to ? new Date(value.to) : null,
      });
    }
  }, [value]);

  const handleSelect = (date) => {
    if (!date) return;

    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      // Start new range
      setDateRange({ from: date, to: null });
    } else {
      // Complete the range
      if (isBefore(date, dateRange.from)) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
    }
  };

  const handleApply = () => {
    if (onChange && dateRange.from) {
      onChange({
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange.from, 'yyyy-MM-dd')
      });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setDateRange({ from: null, to: null });
    if (onChange) onChange({ from: '', to: '' });
  };

  const formatDateRange = () => {
    if (!dateRange.from) return placeholder;
    
    const fromStr = format(dateRange.from, 'MMM dd, yyyy', { locale: id });
    if (!dateRange.to || isSameDay(dateRange.from, dateRange.to)) {
      return fromStr;
    }
    const toStr = format(dateRange.to, 'MMM dd, yyyy', { locale: id });
    return `${fromStr} - ${toStr}`;
  };

  const isDateInRange = (date) => {
    if (!dateRange.from) return false;
    if (!dateRange.to) return isSameDay(date, dateRange.from);
    return isAfter(date, startOfDay(dateRange.from)) && isBefore(date, startOfDay(addDays(dateRange.to, 1)));
  };

  const isDateRangeStart = (date) => {
    return dateRange.from && isSameDay(date, dateRange.from);
  };

  const isDateRangeEnd = (date) => {
    return dateRange.to && isSameDay(date, dateRange.to);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "btn px-2.5 min-w-[15.5rem] bg-white border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 dark:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium text-left justify-start",
            !dateRange.from && "text-muted-foreground"
          )}
        >
          <svg className="fill-current text-gray-400 dark:text-gray-500 ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16">
            <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"></path>
            <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z"></path>
          </svg>
          {formatDateRange()}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {dateRange.from ? format(dateRange.from, 'MMMM yyyy', { locale: id }) : 'Pilih Tanggal'}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const prevMonth = new Date(dateRange.from || new Date());
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setDateRange(prev => ({ ...prev, from: prevMonth }));
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10.5 12.5L6 8l4.5-4.5L10 2.5l-6 5.5 6 5.5z"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  const nextMonth = new Date(dateRange.from || new Date());
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setDateRange(prev => ({ ...prev, from: nextMonth }));
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 3.5L10 8l-4.5 4.5L6 13.5l6-5.5-6-5.5z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <Calendar
            mode="range"
            defaultMonth={dateRange.from || new Date()}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={1}
            className="rounded-md border-0"
            classNames={{
              day: cn(
                "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              ),
              day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
              day_range_start: "bg-blue-600 text-white rounded-l-md",
              day_range_end: "bg-blue-600 text-white rounded-r-md",
              day_in_range: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100",
              day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
              day_disabled: "text-gray-400 dark:text-gray-500 opacity-50",
              day_hidden: "invisible",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            }}
          />
        </div>
        
        <div className="flex justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 text-sm">
          <button
            type="button"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            type="button"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 