export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      {children}
    </div>
  );
}
