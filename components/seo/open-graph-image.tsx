import { ImageResponse } from "next/og";

export const openGraphImageSize = {
  width: 1200,
  height: 630,
};

export function createOpenGraphImage(language: "en" | "es") {
  const content =
    language === "en"
      ? {
          title: "Organize your thoughts with AI",
          description: "Long-term memory and reflective coaching",
        }
      : {
          title: "Organiza tus pensamientos con IA",
          description: "Memoria a largo plazo y coaching reflexivo",
        };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #f8fafc, #dbeafe)",
          color: "#172554",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 600 }}>
          Fawredd Thoughts Assistant
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            maxWidth: 950,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {content.title}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30 }}>
          {content.description}
        </div>
      </div>
    ),
    openGraphImageSize,
  );
}
