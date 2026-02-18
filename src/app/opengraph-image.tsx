import { ImageResponse } from "next/og";

export const alt = "Bible Study Agent - Reformed Theology & Hermeneutics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #3d2b1f 0%, #2c1810 40%, #1a0f0a 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            top: "-200px",
            right: "-200px",
            display: "flex",
          }}
        />

        {/* Cross icon */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "rgba(201,168,76,0.15)",
              border: "2px solid rgba(201,168,76,0.3)",
            }}
          >
            {/* Cross shape using nested divs */}
            <div style={{ display: "flex", position: "relative", width: "40px", height: "56px" }}>
              <div
                style={{
                  position: "absolute",
                  width: "12px",
                  height: "56px",
                  background: "linear-gradient(180deg, #e0c878, #c9a84c)",
                  borderRadius: "3px",
                  left: "14px",
                  top: "0px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "40px",
                  height: "12px",
                  background: "linear-gradient(90deg, #e0c878, #c9a84c)",
                  borderRadius: "3px",
                  left: "0px",
                  top: "14px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#f5f0e8",
              margin: 0,
              letterSpacing: "-1px",
            }}
          >
            Bible Study Agent
          </h1>

          {/* Decorative divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              margin: "4px 0",
            }}
          >
            <div style={{ width: "60px", height: "1px", background: "rgba(201,168,76,0.5)" }} />
            <div
              style={{
                width: "8px",
                height: "8px",
                background: "#c9a84c",
                transform: "rotate(45deg)",
              }}
            />
            <div style={{ width: "60px", height: "1px", background: "rgba(201,168,76,0.5)" }} />
          </div>

          <p
            style={{
              fontSize: "24px",
              color: "rgba(224,200,120,0.8)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Reformed Theology &bull; Hermeneutics &bull; Archaeology
          </p>

          <p
            style={{
              fontSize: "18px",
              color: "rgba(245,240,232,0.5)",
              margin: 0,
              marginTop: "8px",
              maxWidth: "600px",
              textAlign: "center",
              lineHeight: "1.5",
            }}
          >
            AI-powered biblical scholarship aligned with MacArthur, Sproul &amp; Reformed tradition
          </p>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            width: "100%",
            height: "4px",
            background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
