"use client";

// ============================================================
// JsonLd — renders JSON-LD script tags with zero hydration overhead
// Usage: <JsonLd schema={physicianSchema(doctor)} />
// ============================================================

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  );
}
