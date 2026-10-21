import { ImageResponse } from "next/og";
export const alt = "OofCourse — Family-friendly finds for real life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#eaf4ff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 85,
        color: "#12254a",
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 45 }}>
        OofCourse.
      </div>
      <div
        style={{
          fontSize: 79,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: -3,
        }}
      >
        Family-friendly finds
      </div>
      <div style={{ fontSize: 79, lineHeight: 1.1, color: "#197548" }}>
        for real life.
      </div>
      <div style={{ fontSize: 24, marginTop: 40 }}>
        Great Deals? Of Course! · Independent discovery · Demo collection
      </div>
    </div>,
    size,
  );
}
