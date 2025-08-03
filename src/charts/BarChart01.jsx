import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart, BarController, BarElement, LinearScale, TimeScale, Tooltip, Legend, CategoryScale
} from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { formatValue } from '../utils/Utils';

Chart.register(BarController, BarElement, LinearScale, TimeScale, Tooltip, Legend, CategoryScale);

function BarChart01({
  data,
  width,
  height
}) {

  const [chart, setChart] = useState(null)
  const canvas = useRef(null);
  const legend = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    let newChart;
    const ctx = canvas.current;
    if (ctx) {
      // Destroy chart lama jika ada
      if (chart) {
        chart.destroy();
      }

      // Create gradient for bars
      const createGradient = (ctx, color) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '80'); // 50% opacity
        return gradient;
      };

      // Prepare data with gradients
      const enhancedData = {
        ...data,
        datasets: data.datasets.map((dataset, index) => {
          const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
          const color = colors[index % colors.length];
          return {
            ...dataset,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 'flex',
            maxBarThickness: 30,
            minBarLength: 2,
          };
        })
      };

      newChart = new Chart(ctx, {
        type: 'bar',
        data: enhancedData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 20,
              bottom: 20,
              left: 20,
              right: 20,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              border: {
                display: false,
              },
              grid: {
                color: darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)',
                drawBorder: false,
                lineWidth: 1,
              },
              ticks: {
                maxTicksLimit: 6,
                padding: 10,
                color: darkMode ? '#9ca3af' : '#6b7280',
                font: {
                  size: 11,
                  weight: '500',
                },
                callback: (value) => formatValue(value),
              },
            },
            x: {
              type: 'category',
              border: {
                display: false,
              },
              grid: {
                display: false,
              },
              ticks: {
                color: darkMode ? '#9ca3af' : '#6b7280',
                font: {
                  size: 11,
                  weight: '500',
                },
                maxRotation: 45,
                minRotation: 0,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              titleColor: darkMode ? '#f3f4f6' : '#1f2937',
              bodyColor: darkMode ? '#d1d5db' : '#4b5563',
              borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              padding: 12,
              titleFont: {
                size: 13,
                weight: '600',
              },
              bodyFont: {
                size: 12,
                weight: '500',
              },
              callbacks: {
                title: (context) => {
                  const monthLabel = context[0].label;
                  return `Bulan: ${monthLabel}`;
                },
                label: (context) => {
                  return `${context.dataset.label}: ${formatValue(context.parsed.y)}`;
                },
              },
            },
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
          animation: {
            duration: 750,
            easing: 'easeInOutQuart',
          },
          elements: {
            bar: {
              borderRadius: 6,
            },
          },
        },
        plugins: [
          {
            id: 'htmlLegend',
            afterUpdate(c, args, options) {
              const ul = legend.current;
              if (!ul) return;
              // Remove old legend items
              while (ul.firstChild) {
                ul.firstChild.remove();
              }
              // Reuse the built-in legendItems generator
              const items = c.options.plugins.legend.labels.generateLabels(c);
              items.forEach((item) => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors';
                
                // Button element
                const button = document.createElement('button');
                button.className = 'flex items-center space-x-3 w-full';
                button.style.opacity = item.hidden ? '0.4' : '1';
                button.onclick = () => {
                  c.setDatasetVisibility(item.datasetIndex, !c.isDatasetVisible(item.datasetIndex));
                  c.update();
                };
                
                // Color indicator
                const indicator = document.createElement('div');
                indicator.className = 'w-3 h-3 rounded-full';
                indicator.style.backgroundColor = item.fillStyle;
                indicator.style.border = `2px solid ${item.fillStyle}20`;
                
                // Label
                const label = document.createElement('span');
                label.className = 'text-sm font-medium text-gray-700 dark:text-gray-200';
                label.textContent = item.text;
                
                // Value
                const value = document.createElement('span');
                value.className = 'text-sm font-semibold text-gray-900 dark:text-gray-100';
                const totalValue = c.data.datasets[item.datasetIndex].data.reduce((a, b) => a + b, 0);
                value.textContent = formatValue(totalValue);
                
                button.appendChild(indicator);
                button.appendChild(label);
                button.appendChild(value);
                li.appendChild(button);
                ul.appendChild(li);
              });
            },
          },
        ],
      });
      setChart(newChart);
    }
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, width, height, darkMode]);

  useEffect(() => {
    if (!chart) return;

    if (darkMode) {
      chart.options.scales.x.ticks.color = '#9ca3af';
      chart.options.scales.y.ticks.color = '#9ca3af';
      chart.options.scales.y.grid.color = 'rgba(156, 163, 175, 0.1)';
      chart.options.plugins.tooltip.backgroundColor = 'rgba(17, 24, 39, 0.95)';
      chart.options.plugins.tooltip.titleColor = '#f3f4f6';
      chart.options.plugins.tooltip.bodyColor = '#d1d5db';
      chart.options.plugins.tooltip.borderColor = 'rgba(75, 85, 99, 0.3)';
    } else {
      chart.options.scales.x.ticks.color = '#6b7280';
      chart.options.scales.y.ticks.color = '#6b7280';
      chart.options.scales.y.grid.color = 'rgba(156, 163, 175, 0.2)';
      chart.options.plugins.tooltip.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      chart.options.plugins.tooltip.titleColor = '#1f2937';
      chart.options.plugins.tooltip.bodyColor = '#4b5563';
      chart.options.plugins.tooltip.borderColor = 'rgba(209, 213, 219, 0.5)';
    }
    chart.update('none');
  }, [currentTheme]);

  return (
    <React.Fragment>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
        <ul ref={legend} className="flex flex-wrap gap-4"></ul>
      </div>
      <div className="grow p-4">
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </React.Fragment>
  );
}

export default BarChart01;
