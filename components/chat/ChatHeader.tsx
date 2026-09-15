export default function ChatHeader() {
  return (
    <header
      style={{
        padding: "16px",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Real estate assistant
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "13px",
          color: "#777",
        }}
      >
        Your personal AI for finding the perfect home
      </div>
    </header>
  );
}