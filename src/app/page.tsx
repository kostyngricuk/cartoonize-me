
import { Smile } from 'lucide-react';
import CartoonArea from '@/components/cartoon-area';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <Smile className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            CartoonizeMe
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Transform your photos into captivating cartoons with the power of AI!
        </p>
      </header>
      
      <CartoonArea />

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CartoonizeMe. All rights reserved.</p>
        <p>Powered by Firebase Studio & Genkit AI.</p>
      </footer>
    </main>
  );
}
