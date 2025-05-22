
"use client";

import { useState, ChangeEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Download, Share2, Image as ImageIcon, Wand2, ArrowRight, ArrowDown } from 'lucide-react';
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
  const cartoonImageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear cartoon image if original image changes
    setCartoonImageSrc(null);
  }, [originalImageSrc]);

  useEffect(() => {
    if (cartoonImageSrc && !isLoading && cartoonImageContainerRef.current) {
      cartoonImageContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [cartoonImageSrc, isLoading]);

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
        event.target.value = ''; // Clear the input
        return;
      }
      setOriginalImageFile(file);
      const reader = new FileReader();
      reader.onloadstart = () => {
        setError(null); // Clear previous errors on new load
        setOriginalImageSrc(null); // Clear previous image preview
      };
      reader.onloadend = () => {
        setOriginalImageSrc(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          title: 'File Read Error',
          description: 'Could not read the selected file. Please try another image.',
          variant: 'destructive',
        });
        setOriginalImageFile(null);
        setOriginalImageSrc(null);
        setError('Failed to read file.');
      }
      reader.readAsDataURL(file);
      event.target.value = ''; // Clear the file input so the same file can be re-selected
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
    
    let filename = 'cartoon_image.png';
    if (originalImageFile?.name) {
        const nameParts = originalImageFile.name.split('.');
        nameParts.pop(); 
        filename = `${nameParts.join('.')}_cartoon.png`;
    }

    link.download = filename;
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
        try {
            await navigator.share({
              files: [file],
            });
            toast({ title: 'Image Shared!', description: 'Your cartoon image has been shared.' });
            return;
        } catch (shareError) {
            if ((shareError as DOMException).name === 'AbortError') {
              console.log('Share was cancelled by the user.');
            } else {
              console.error('Error using navigator.share:', shareError);
            }
        }
      }

      if (navigator.clipboard && typeof navigator.clipboard.write === 'function') {
        try {
          // Browsers like Chrome require the blob to be of a known image type for ClipboardItem
          const clipboardItem = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([clipboardItem]);
          toast({ title: 'Image Copied!', description: 'Cartoon image copied to clipboard.' });
          return; 
        } catch (copyError) {
          console.error('Error copying image to clipboard:', copyError);
        }
      }
      
      toast({
        title: 'Sharing Not Supported',
        description: 'Direct sharing or copying is not supported by your browser. Please download the image to share it.',
        variant: 'default',
      });

    } catch (err) {
      console.error('Error preparing image for sharing:', err);
      toast({
        title: 'Sharing Failed',
        description: 'Could not prepare image for sharing. Please try downloading.',
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
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <Label htmlFor="file-upload" className="flex-grow">
               <Input id="file-upload" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
               <Button asChild variant="outline" className="w-full cursor-pointer">
                <div><UploadCloud className="mr-2 h-5 w-5" /> {originalImageFile ? originalImageFile.name : 'Choose an image...'}</div>
               </Button>
            </Label>
            <Button onClick={handleCartoonize} disabled={isLoading || !originalImageSrc} className="bg-accent hover:bg-accent/90 w-full md:w-auto">
              <Wand2 className="mr-2 h-5 w-5" />
              {isLoading ? 'Cartoonizing...' : 'Cartoonize!'}
            </Button>
          </div>
          {isLoading && <Progress value={undefined} className="w-full h-2 mt-2 animate-pulse" />}
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>

        {originalImageSrc && (
          <div className="flex flex-col md:flex-row items-center md:items-stretch md:justify-between gap-4 pt-6">
            <div className="w-full md:w-[45%] space-y-2">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">Original Image</h3>
              <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center bg-muted/20 overflow-hidden">
                <Image src={originalImageSrc} alt="Original" width={400} height={400} className="object-cover w-full h-full" data-ai-hint="uploaded photo" />
              </div>
            </div>

            {(isLoading || cartoonImageSrc) && (
              <>
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="h-10 w-10 text-primary" />
                </div>

                <div className="flex md:hidden items-center justify-center">
                  <ArrowDown className="h-10 w-10 text-primary" />
                </div>

                <div ref={cartoonImageContainerRef} className="w-full md:w-[45%] space-y-2">
                  <h3 className="text-lg font-semibold text-center text-muted-foreground">Cartoon Version</h3>
                  <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center bg-muted/20 overflow-hidden">
                    {isLoading ? (
                       <div className="w-full h-full flex flex-col items-center justify-center">
                          <Skeleton className="h-3/4 w-3/4" />
                          <p className="mt-2 text-sm text-muted-foreground">Generating your cartoon...</p>
                       </div>
                    ) : cartoonImageSrc ? (
                      <Image src={cartoonImageSrc} alt="Cartoonized" width={400} height={400} className="object-cover w-full h-full" data-ai-hint="cartoon character" />
                    ) : (
                       <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                        <p>Your cartoonized image will appear here after generation.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {cartoonImageSrc && !isLoading && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={handleDownload} variant="outline" size="lg">
              <Download className="mr-2 h-5 w-5" /> Download
            </Button>
            <Button onClick={handleShare} variant="default" size="lg" className="bg-primary hover:bg-primary/90">
              <Share2 className="mr-2 h-5 w-5" /> Share Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

