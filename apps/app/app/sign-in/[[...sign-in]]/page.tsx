import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <SignIn path="/app/sign-in" />
      </div>
    </div>
  );
}
