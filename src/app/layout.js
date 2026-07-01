import "./globals.css";

export const metadata = {
  title: "SaaSify - SaaS Subscription Management Platform",
  description: "Sleek subscription, plan, billing, and usage analytics dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
