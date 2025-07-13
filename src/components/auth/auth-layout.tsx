import defaultSoftwareDetail from "@/softwareSetting";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="container relative flex min-h-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Logo */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {defaultSoftwareDetail.softwareName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Advanced Wire Manufacturing Management
            </p>
          </div>

          {/* Auth Card */}
          <div className="w-full">
            <div className="w-full border-none bg-white/50 backdrop-blur-xl dark:bg-gray-800/50 rounded-lg p-6">
              <div className="flex flex-col space-y-2 text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 