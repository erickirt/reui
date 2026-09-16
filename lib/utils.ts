import { absoluteUrl as getAbsoluteUrl } from "@/lib/site-url"

export { cn } from "cn"

export function isActive(pathname: string, href: string) {
  const normalizedPathname = pathname.replace(/\/$/, "")
  const normalizedHref = href.replace(/\/$/, "")
  return (
    normalizedPathname === normalizedHref ||
    (normalizedPathname.startsWith(normalizedHref) && normalizedHref !== "")
  )
}

export function absoluteUrl(path: string) {
  return getAbsoluteUrl(path)
}

export function formatLabel(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function normalizeSlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-")
}
