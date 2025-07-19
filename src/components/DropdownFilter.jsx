import React, { useState, useRef, useEffect } from "react";
import Transition from "../utils/Transition";

function DropdownFilter({ align, options = [], selected = {}, onChange, onApply, onClear }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState(selected);

  const trigger = useRef(null);
  const dropdown = useRef(null);

  useEffect(() => {
    setLocalSelected(selected);
  }, [selected]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const handleCheckbox = (group, value) => {
    setLocalSelected((prev) => {
      const prevArr = prev[group] || [];
      let newArr;
      if (prevArr.includes(value)) {
        newArr = prevArr.filter((v) => v !== value);
      } else {
        newArr = [...prevArr, value];
      }
      const updated = { ...prev, [group]: newArr };
      if (onChange) onChange(updated);
      return updated;
    });
  };

  const handleClear = () => {
    setLocalSelected({});
    if (onClear) onClear();
  };

  const handleApply = () => {
    if (onApply) onApply(localSelected);
    setDropdownOpen(false);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="btn px-2.5 bg-white dark:bg-gray-800 border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shadow"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        type="button"
      >
        <span className="sr-only">Filter</span>
        <svg
          className="fill-current"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path d="M0 3a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1ZM3 8a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM7 12a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Z" />
        </svg>
      </button>
      <Transition
        show={dropdownOpen}
        tag="div"
        className={`origin-top-right z-10 absolute top-full left-0 right-auto min-w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 pt-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === "right"
            ? "md:left-auto md:right-0"
            : "md:left-0 md:right-auto"
        } pb-20`}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={dropdown}>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase pt-1.5 pb-2 px-3">
            Filters
          </div>
          <ul className="mb-4">
            {options.map((group) => (
              <li key={group.label} className="py-1 px-3">
                <div className="font-semibold text-gray-700 dark:text-gray-200 text-xs mb-1">{group.label}</div>
                {group.values.map((val) => (
                  <label className="flex items-center mb-1" key={val}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                      checked={localSelected[group.key]?.includes(val) || false}
                      onChange={() => handleCheckbox(group.key, val)}
                />
                    <span className="text-sm font-medium ml-2 text-gray-700 dark:text-gray-300">{val}</span>
              </label>
                ))}
            </li>
            ))}
          </ul>
          <div className="py-2 px-3 border-t border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/20">
            <ul className="flex items-center justify-between">
              <li>
                <button
                  onClick={handleClear}
                  className="btn-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                  type="button"
                >
                  Clear
                </button>
              </li>
              <li>
                <button
                  className="btn-xs bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-800 hover:bg-gray-800 dark:hover:bg-white"
                  onClick={handleApply}
                  type="button"
                >
                  Apply
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownFilter;
