import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setPriorityColor(priority: string) {
  switch (priority) {
    case "Low":
      return "bg-blue-200 text-blue-800 hover:bg-blue-300";
    case "Medium":
      return "bg-green-200 text-green-800 hover:bg-green-300";
    case "High":
      return "bg-yellow-200 text-yellow-800 hover:bg-yellow-300";
    case "Urgent":
      return "bg-red-200 text-red-800 hover:bg-red-300";
    default:
      return "bg-blue-200 text-blue-800 hover:bg-blue-300";
  }
}

export function getInitials(name: string) {
  const names = name.split(" ");
  return names
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function formatDate(date: string) {
  const d = new Date(date);
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);

  if (d.toDateString() === new Date().toDateString()) {
    return "Today";
  }

  // if (d.toDateString() === new Date(Date.now() - 864e5).toDateString()) {
  //   return "Yesterday";
  // }

  if (d.toDateString() === new Date(Date.now() + 864e5).toDateString()) {
    return "Tomorrow";
  }

  return `${formattedDate}${year === currentYear ? "" : ", " + year}`;
}

export function formatDateTime(date: string) {
  const d = new Date(date);
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);
  const formattedTime = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "numeric",
  }).format(d);

  if (d.toDateString() === new Date().toDateString()) {
    return `Today, ${formattedTime}`;
  }

  // if (d.toDateString() === new Date(Date.now() - 864e5).toDateString()) {
  //   return "Yesterday";
  // }

  if (d.toDateString() === new Date(Date.now() + 864e5).toDateString()) {
    return `Tomorrow, ${formattedTime}`;
  }

  return `${formattedDate}${
    year === currentYear ? "" : ", " + year
  }, ${formattedTime}`;
}

export function formatDueDateColor(date: string, status: string) {
  const d = new Date(date);
  const currentDate = new Date();
  const diff = d.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

  if (status === "Completed") {
    return "bg-green-200 text-green-500 hover:bg-green-300 hover:text-green-800";
  }

  switch (true) {
    case diffDays < 0:
      return "bg-red-200 text-red-800 hover:bg-red-300 hover:text-red-900";
    case diffDays === 0:
      return "bg-blue-200 text-blue-500 hover:bg-blue-300 hover:text-blue-800";
    case diffDays === 1:
      return "bg-yellow-200 text-yellow-500 hover:bg-yellow-300 hover:text-yellow-800";
    default:
      return "text-neutral-500 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-800";
  }
}

export function formatHTML(html: string) {
  return { __html: html };
}
