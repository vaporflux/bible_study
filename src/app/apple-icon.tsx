import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4a3728 0%, #2c1810 100%)",
          borderRadius: "32px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Cross */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "110px",
                background: "linear-gradient(180deg, #e0c878 0%, #c9a84c 100%)",
                borderRadius: "6px",
                position: "absolute",
                top: "-10px",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "28px",
                background: "linear-gradient(90deg, #e0c878 0%, #c9a84c 100%)",
                borderRadius: "6px",
                position: "absolute",
                top: "20px",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
