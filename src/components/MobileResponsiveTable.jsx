import React from 'react';

export default function MobileResponsiveTable({ 
  data, 
  columns, 
  renderMobileRow, 
  className = "",
  emptyMessage = "Tidak ada data"
}) {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">{emptyMessage}</div>
          </div>
        ) : (
          data.map((item, index) => (
            <div key={item.id || index} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
              {renderMobileRow(item, index)}
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider ${
                  column.className || ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      column.className || ''
                    }`}
                  >
                    {column.render ? column.render(item, index) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 