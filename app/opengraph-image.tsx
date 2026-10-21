import { ImageResponse } from "next/og";
export const alt = "OofCourse — Great Deals? Of Course!";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#e6e9da",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 85,
        color: "#203b2e",
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 45 }}>
        OofCourse.
      </div>
      <div
        style={{
          fontSize: 82,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -4,
        }}
      >
        Great Deals?
      </div>
      <div style={{ fontSize: 82, lineHeight: 1.1 }}>Of Course!</div>
      <div style={{ fontSize: 22, marginTop: 40 }}>
        Thoughtful finds for your everyday. · Demo collection
      </div>
    </div>,
    size,
  );
}
