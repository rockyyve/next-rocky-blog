import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            An error occurred during authentication. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>If the problem persists, please contact support.</p>
        </CardContent>
      </Card>
    </div>
  );
}
