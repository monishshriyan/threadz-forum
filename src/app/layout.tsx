import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
// import { Toaster } from "@/components/ui/Toaster";
import { Toaster } from "@/components/ui/Sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Threadz",
  description: "A community platform built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn("antialiased", inter.className)}
    >
      <body className="h-[100dvh] antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Toaster richColors />
          <Providers>
            {/* @ts-expect-error Server Component */}
            <Navbar />
            {authModal}

            <div className="container h-full pt-16">{children}</div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
