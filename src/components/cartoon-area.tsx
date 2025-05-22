
"use client";

import { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, Download, Send, Image as ImageIcon, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cartoonizeImage, type CartoonizeImageInput } from '@/ai/flows/cartoonize-image';
import { Skeleton } from './ui/skeleton';

export default function CartoonArea() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [cartoonImageSrc, setCartoonImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clear cartoon image if original image changes
    setCartoonImageSrc(null);
  }, [originalImageSrc]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (e.g., PNG, JPG, GIF).',
          variant: 'destructive',
        });
        setOriginalImageFile(null);
        setOriginalImageSrc(null);
        return;
      }
      setOriginalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageSrc(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCartoonize = async () => {
    if (!originalImageSrc || !originalImageFile) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setCartoonImageSrc(null); // Clear previous cartoon

    try {
      const input: CartoonizeImageInput = { photoDataUri: originalImageSrc };
      const result = await cartoonizeImage(input);
      setCartoonImageSrc(result.cartoonDataUri);
      toast({
        title: 'Cartoonization Complete!',
        description: 'Your cartoon image is ready.',
      });
    } catch (e) {
      console.error('Cartoonization error:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to cartoonize image: ${errorMessage}`);
      toast({
        title: 'Cartoonization Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!cartoonImageSrc) return;
    const link = document.createElement('a');
    link.href = cartoonImageSrc;
    link.download = 'cartoon_image.png'; // Suggest a filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Download Started', description: 'Your cartoon image is downloading.'});
  };

  const handleShare = async () => {
    if (!cartoonImageSrc) return;

    try {
      const response = await fetch(cartoonImageSrc);
      const blob = await response.blob();
      const file = new File([blob], 'cartoon.png', { type: blob.type });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Cartoon Image',
          text: 'Check out this cool cartoon I created with CartoonizeMe!',
          files: [file],
        });
        toast({ title: 'Shared!', description: 'Image shared successfully.' });
      } else {
        // Fallback for browsers that don't support navigator.share or can't share files
        // Attempt to share a link to the app or prompt download
        const shareUrl = window.location.href;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out CartoonizeMe to create awesome cartoon images!')}`;
        window.open(telegramUrl, '_blank');
        toast({ title: 'Share via Telegram', description: 'Opened Telegram share link. You can also download the image to share it directly.' });
      }
    } catch (err) {
      console.error('Error sharing:', err);
      toast({
        title: 'Sharing Failed',
        description: 'Could not share image. Please try downloading and sharing manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Wand2 className="mr-2 h-6 w-6 text-primary" />
          Create Your Cartoon
        </CardTitle>
        <CardDescription>
          Upload your photo, and let our AI magically transform it into a cartoon!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-base font-medium">Upload Photo</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="file-upload" className="flex-grow">
               <Input id="file-upload" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
               <Button asChild variant="outline" className="w-full cursor-pointer">
                <div><UploadCloud className="mr-2 h-5 w-5" /> {originalImageFile ? originalImageFile.name : 'Choose an image...'}</div>
               </Button>
            </Label>
            <Button onClick={handleCartoonize} disabled={isLoading || !originalImageSrc} className="bg-accent hover:bg-accent/90">
              <Wand2 className="mr-2 h-5 w-5" />
              {isLoading ? 'Cartoonizing...' : 'Cartoonize!'}
            </Button>
          </div>
          {isLoading && <Progress value={undefined} className="w-full h-2 mt-2 animate-pulse" />}
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-center text-muted-foreground">Original Image</h3>
            <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center bg-muted/20 overflow-hidden">
              {originalImageSrc ? (
                <Image src={originalImageSrc} alt="Original" width={400} height={400} className="object-contain max-h-full max-w-full" data-ai-hint="uploaded photo" />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                  <p>Your uploaded image will appear here.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-center text-muted-foreground">Cartoon Version</h3>
            <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center bg-muted/20 overflow-hidden">
              {isLoading ? (
                 <div className="w-full h-full flex flex-col items-center justify-center">
                    <Skeleton className="h-3/4 w-3/4" />
                    <p className="mt-2 text-sm text-muted-foreground">Generating your cartoon...</p>
                 </div>
              ) : cartoonImageSrc ? (
                <Image src={cartoonImageSrc} alt="Cartoonized" width={400} height={400} className="object-contain max-h-full max-w-full" data-ai-hint="cartoon character" />
              ) : (
                 <div className="text-center text-muted-foreground p-4">
                  <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                  <p>Your cartoonized image will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {cartoonImageSrc && !isLoading && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={handleDownload} variant="outline" size="lg">
              <Download className="mr-2 h-5 w-5" /> Download
            </Button>
            <Button onClick={handleShare} variant="default" size="lg" className="bg-primary hover:bg-primary/90">
              <Send className="mr-2 h-5 w-5" /> Share to Telegram
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

