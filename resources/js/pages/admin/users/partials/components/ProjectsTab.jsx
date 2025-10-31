import React from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function ProjectsTab() {
  return (
    <div className="space-y-8 fade-in">
      {/* Improved General Projects Stats Card */}
      <div className="bg-primary/10 dark:bg-primary/20 rounded-xl shadow-md border border-primary/10 dark:border-primary/20 p-6 flex gap-7 justify-between items-center mb-2">
        <div className="flex items-center gap-2"><span className="text-3xl font-bold text-primary">8</span><span className="ml-1 text-base font-semibold text-primary">Total Projects</span></div>
        <div className="flex items-center gap-2"><span className="text-xl font-bold text-blue-800 dark:text-blue-100">2</span><span className="ml-1 text-sm text-blue-800 dark:text-blue-100">Ongoing</span></div>
        <div className="flex items-center gap-2"><span className="text-xl font-bold text-green-700">6</span><span className="ml-1 text-sm text-green-700">Completed</span></div>
      </div>
      {/* Responsive cards for projects */}
      <section className="flex flex-col gap-4 sm:flex-row sm:gap-6 flex-wrap">
        <div className="bg-muted dark:bg-muted/20 p-4 rounded-xl flex-1 min-w-[200px] flex flex-col gap-1 mb-1">
          <span className="text-sm font-bold text-primary">Inventory App</span>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge-status-success">Completed</span>
            <span className="badge-tech">React</span>
            <span className="badge-tech">Node.js</span>
          </div>
        </div>
        <div className="bg-muted dark:bg-muted/20 p-4 rounded-xl flex-1 min-w-[200px] flex flex-col gap-1 mb-1">
          <span className="text-sm font-bold text-primary">Booking System</span>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge-status-warning">In Progress</span>
            <span className="badge-tech">Vue</span>
            <span className="badge-tech">Firebase</span>
          </div>
        </div>
      </section>

      {/* All Projects Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 mt-2">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left">Project Title</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-muted/20">
              <td className="p-3 font-medium">How to use React Hooks Effectively</td>
              <td className="p-3">2025-08-21</td>
              <td className="p-3">Guide</td>
              <td className="p-3 text-green-700 dark:text-green-300">Published</td>
              <td className="p-3 flex gap-2">
                <button className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-200 dark:hover:bg-blue-700 transition focus:ring-2 focus:ring-yellow-500">View</button>
                <button className="px-3 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold hover:bg-red-200 dark:hover:bg-red-700 transition focus:ring-2 focus:ring-yellow-500">Delete</button>
              </td>
            </tr>
            <tr className="hover:bg-muted/20">
              <td className="p-3 font-medium">Database Design for Beginners</td>
              <td className="p-3">2025-07-11</td>
              <td className="p-3">Announcement</td>
              <td className="p-3 text-yellow-700 dark:text-yellow-300">Draft</td>
              <td className="p-3 flex gap-2">
                <button className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-200 dark:hover:bg-blue-700 transition focus:ring-2 focus:ring-yellow-500">View</button>
                <button className="px-3 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold hover:bg-red-200 dark:hover:bg-red-700 transition focus:ring-2 focus:ring-yellow-500">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <h4 className="text-base font-semibold mb-2 text-neutral-700 dark:text-yellow-200">Project Feature Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>Ongoing Projects: <span className="font-bold text-primary">2</span></div>
          <div>Teams Participated: <span className="font-bold text-blue-800 dark:text-blue-100">4</span></div>
          <div>Total Features: <span className="font-bold">31</span></div>
          <div>Critical Fixes: <span className="font-bold text-error">1</span></div>
        </div>
      </div>
    </div>
  );
}
