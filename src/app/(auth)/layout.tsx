export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #e0f2fe 100%)",
        padding: "32px 16px",
      }}
    >
      {children}
    </div>
  );
}
