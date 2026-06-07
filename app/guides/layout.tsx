// Guides use a light reading surface (matching haifengmachinery.com) instead of the
// catalog's dark theme. The `guide-light` wrapper paints a full-bleed white band and
// re-maps the global dark-theme utility colors back to light within /guides only.
export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <div className="guide-light">{children}</div>
}
