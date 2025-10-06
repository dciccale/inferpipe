import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Create your Inferpipe account
          </h1>
          <p className="text-muted-foreground">
            Sign up to start building AI workflows
          </p>
        </div>
        <div>
          <SignUp
            path="/app/sign-up"
            routing="path"
            appearance={{
              elements: {
                rootBox: "mx-auto",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
