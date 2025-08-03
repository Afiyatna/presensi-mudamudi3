import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip, Legend, CategoryScale
} from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip, Legend, CategoryScale);

function LineChart01({
  data,
  width,
  height
}) {

  const [chart, setChart] = useState(null)
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';

  useEffect(() => {
    let newChart;
    const ctx = canvas.current;
    if (ctx) {
      // Destroy chart lama jika ada
      if (chart) {
        chart.destroy();
      }

      // Prepare data with enhanced styling
      const enhancedData = {
        ...data,
        datasets: data.datasets.map((dataset, index) => {
          const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
          const color = colors[index % colors.length];
          return {
            ...dataset,
            borderColor: color,
            backgroundColor: color + '20', // 20% opacity for fill
            borderWidth: 3,
            pointBackgroundColor: color,
            pointBorderColor: darkMode ? '#1f2937' : '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBorderWidth: 3,
            fill: true,
            tension: 0.4,
            pointStyle: 'circle',
          };
        })
      };

      newChart = new Chart(ctx, {
        type: 'line',
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
            point: {
              hoverRadius: 8,
              radius: 6,
            },
            line: {
              tension: 0.4,
            },
          },
        },
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
    <div className="p-4">
      <canvas ref={canvas} width={width} height={height}></canvas>
    </div>
  );
}

export default LineChart01;