import { ImageResponse } from "next/og";

export const alt = "Favour Michael — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0B0D10",
          color: "#F2F0EA",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", color: "#6FE7DD", fontSize: 24, letterSpacing: 4 }}>
          SOFTWARE ENGINEER
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, marginTop: 24 }}>
          Favour Michael
        </div>
        <div style={{ display: "flex", color: "#8B8F96", fontSize: 28, marginTop: 24 }}>
          Frontend-focused engineer building fast, reliable interfaces.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            width: 200,
            height: 4,
            background: "#FFA630",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
