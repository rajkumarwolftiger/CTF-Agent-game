import "./globals.css";

export const metadata = {
  title: "Cyber CTF Agent",
  description: "Gamified security-learning platform powered by AI agents.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
