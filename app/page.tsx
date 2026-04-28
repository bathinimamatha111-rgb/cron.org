import Image from "next/image";
import { Card, CardContent, CardHeader,CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="min-h-screen">

      {/* HEADER */}
      {/* <header className="backdrop-blur-sm border-b border-gray-200 flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo copy.webp"
            alt="Logo"
            width={180}
            height={60}
            className="h-10 w-auto"
          />
        </div>
      </header> */}
      <div className="flex items-center justify-center min-h-[10vh] bg-gray-100">
          <Image
            src="/logo copy.webp"
            alt="Logo"
            width={280}
            height={200}
            className="h-50 w-auto"
          />
        </div>

      {/* LOGIN SECTION */}
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-100">
        <Card className="w-full max-w-sm">

          <CardHeader className="flex flex-col items-center">
            
            <CardTitle>Sign in</CardTitle>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-10 w -full">

              <Input className="w-full" type="email" placeholder="Enter email" />
              <Input className="w-full" type="password" placeholder="Enter password" />

               <Button variant="outline" className="w-full">
               Sign in 
        </Button>

            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="text-primary font-medium hover:underline">
          Login
        </a>
      </p>
    </CardFooter>

        </Card>
      </div>
{/* 1. The Wrapper: Must be flex, items-center, and justify-center */}
    </main>
  );
}

       
  

       
      
   
    
          
