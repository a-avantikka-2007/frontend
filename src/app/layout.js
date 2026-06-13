export const metadata = {
  title: "User Management System",
  description: "Next.js Form with MySQL Backend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f3f4f6" }}>
        {children}
      </body>
    </html>
  );
}