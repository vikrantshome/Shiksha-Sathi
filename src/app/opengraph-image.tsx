import { ImageResponse } from "next/og";

export const alt = "Shiksha Sathi — Create, Share & Auto-Grade Assignments";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top right, rgba(198, 232, 248, 0.92), transparent 28%), linear-gradient(135deg, #f7f5ef 0%, #eef1eb 52%, #e3ecef 100%)",
        fontFamily: "Manrope, Geist Sans, Arial, sans-serif",
        color: "#30332f",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -90,
          right: -110,
          width: 360,
          height: 360,
          borderRadius: 9999,
          background: "rgba(68, 99, 113, 0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: 9999,
          background: "rgba(84, 96, 115, 0.12)",
        }}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "54px 58px",
          gap: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  background: "linear-gradient(135deg, #446371 0%, #385765 100%)",
                  color: "#f2faff",
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                S
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#5d605b",
                    fontWeight: 700,
                  }}
                >
                  Teacher Portal
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Shiksha Sathi
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 660,
              }}
            >
              <div
                style={{
                  fontSize: 68,
                  lineHeight: 1.02,
                  fontWeight: 800,
                  letterSpacing: "-0.055em",
                }}
              >
                Create, Share & Auto-Grade Assignments
              </div>
              <div
                style={{
                  fontSize: 26,
                  lineHeight: 1.4,
                  color: "#5d605b",
                  maxWidth: 620,
                }}
              >
                NCERT-aligned question bank, link-based student flow, and
                performance reporting for Indian classrooms.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {[
              "NCERT Question Bank",
              "Shareable Student Links",
              "Teacher Result Dashboard",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(121,124,118,0.18)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#385765",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: 310,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: 26,
              borderRadius: 28,
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(121,124,118,0.14)",
              boxShadow: "0 24px 60px rgba(48, 51, 47, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#5d605b",
              }}
            >
              Snapshot
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  color: "#5d605b",
                }}
              >
                <span>Selected Questions</span>
                <span style={{ color: "#30332f", fontWeight: 800 }}>12</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  color: "#5d605b",
                }}
              >
                <span>Total Marks</span>
                <span style={{ color: "#30332f", fontWeight: 800 }}>15</span>
              </div>
            </div>
            <div
              style={{
                marginTop: 4,
                display: "flex",
                height: 10,
                borderRadius: 9999,
                background: "#d6e5ec",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "78%",
                  background: "linear-gradient(90deg, #446371 0%, #6b8794 100%)",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 24,
              borderRadius: 28,
              background: "#446371",
              color: "#f2faff",
              boxShadow: "0 24px 60px rgba(48, 51, 47, 0.12)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.82,
              }}
            >
              Designed For
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Indian teachers who need speed, clarity, and trust.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(<OgCard />, size);
}
