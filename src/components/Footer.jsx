import React from "react";

export default function Footer({ className = "" }) {
  return (
    <footer className={`w-full py-4 text-center bg-gray-50 text-sm mt-auto border-t border-gray-200 ${className}`}>
      <div className="mt-1 text-gray-700">
        Didukung oleh <b>PPG Daerah Kendal</b>
      </div>
      <div>
        Website ini dibuat oleh{" "}
        <a
          href="https://afiyatna.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          afiyatna.vercel.app
        </a>{" "}
        dan{" "}
        <a
          href="https://abuabdirohman.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          abuabdirohman.com
        </a>
      </div>
    </footer>
  );
} 