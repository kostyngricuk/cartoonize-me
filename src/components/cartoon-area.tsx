
"use client";

import { useState, ChangeEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Download, Image as ImageIcon, Wand2, ArrowRight, ArrowDown, Send, Instagram as InstagramIcon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cartoonizeImage, type CartoonizeImageInput } from '@/ai/flows/cartoonize-image';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// SVG Icon for WhatsApp
const WhatsAppLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#25D366" {...props}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.53 14.3c-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.28-.69.87-.85 1.04s-.31.18-.58.06c-.27-.12-1.14-.42-2.18-1.35-.81-.73-1.36-1.63-1.53-1.91-.16-.28-.02-.43.12-.57.13-.13.27-.31.41-.47.16-.18.21-.31.31-.53s.05-.42-.03-.57c-.08-.14-.61-1.47-.84-2.01-.23-.54-.46-.47-.61-.47h-.5c-.18 0-.46.05-.7.31-.23.27-.87.85-.87 2.07s.9 2.4 1.02 2.56c.12.18 1.81 2.78 4.4 3.89 2.58 1.1 2.58.74 3.05.71.46-.04 1.59-.65 1.81-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z"/>
  </svg>
);

// SVG Icon for Viber
const ViberLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="#7360F2" {...props}>
    <path d="M17.813 0c-3.063 0-5.726 1.688-7.184 4.24L9.57 5.502c-.25.626-.094 1.32.343 1.782.468.438 1.155.53 1.718.25l1.06-.53c.313-.156.53-.5.53-.843V5.5c0-1.032.843-1.875 1.875-1.875s1.875.843 1.875 1.875v.156c0 .344.218.688.53.844l1.062.53c.563.282 1.25.188 1.719-.25.437-.468.594-1.156.343-1.782l-1.06-1.264C19.383 1.688 19.347 0 17.813 0zM7.013 6.563c-1.015 0-1.843.828-1.843 1.844v6.093c0 .344-.125.657-.344.907l-1.03 1.03c-.345.344-.563.813-.563 1.313v2.718c0 .47.375.844.844.844h2.718c.5 0 .97-.218 1.313-.562l1.03-1.031c.25-.25.375-.563.375-.906V8.407c0-1.016-.828-1.844-1.843-1.844zm13.844 2.437l-1.72 2.158c-.28.343-.25.843.063 1.155l2.343 2.344c.313.313.813.313 1.125 0l2.344-2.344c.312-.312.343-.812.062-1.155L22.726 9c-.375-.47-.97-.53-1.406-.125l-1.469 1.22c-.032-.016-.063-.031-.094-.031h-.03c-.407-.032-.782.156-1.032.438zM5.451 21.513l-1.67-5.11c-.172-.53-.031-1.125.375-1.53l4.125-4.126c.406-.406 1-.547 1.531-.375l5.109 1.67c.531.172 1.125.031 1.531-.375l2.14-2.14c.407-.406.407-1.063 0-1.47l-1.015-1.015c-.406-.406-1.063-.406-1.47 0l-2.14 2.14c-.406.406-.9.547-1.53.375l-5.11-1.67c-.53-.172-1.125-.031-1.53.375L1.154 12.39c-.406.406-.547 1-.375 1.531l1.672 5.109c.172.531.031 1.125-.375 1.531l-2.032 2.03c-.406.407-.406 1.063 0 1.47l1.016 1.016c.406.406 1.062.406 1.469 0l2.03-2.031c.407-.406.548-.999.376-1.531z"/>
  </svg>
);


export default function CartoonArea() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [cartoonImageSrc, setCartoonImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const cartoonImageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        event.target.value = '';
        return;
      }
      setOriginalImageFile(file);
      const reader = new FileReader();
      reader.onloadstart = () => {
        setError(null);
        setOriginalImageSrc(null); 
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
      event.target.value = '';
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
    setCartoonImageSrc(null);

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

  const handleSocialShare = async (platform: 'telegram' | 'whatsapp' | 'viber' | 'instagram') => {
    if (!cartoonImageSrc) {
      toast({ title: 'No Image', description: 'Please generate a cartoon image first.', variant: 'destructive' });
      return;
    }

    const text = encodeURIComponent("Check out my cartoon created with CartoonizeMe!");
    const imageUrl = cartoonImageSrc; // This is a data URI

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "cartoon.png", { type: blob.type });

      if (platform !== 'instagram' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Cartoon!',
          text: 'Check out my cartoon!',
        });
        toast({ title: `Shared!`, description: 'Image sent successfully.' });
        return;
      }
      
      // Fallback to platform-specific URLs or clipboard copy
      switch (platform) {
        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${text}`, '_blank');
          toast({ title: 'Sharing to Telegram', description: 'Please complete the action in the new tab.' });
          break;
        case 'whatsapp':
           // WhatsApp Web API doesn't directly support data URI for images in share links.
           // Best user experience is to copy and instruct or use navigator.share if available.
          if (navigator.clipboard && typeof navigator.clipboard.write === 'function') {
            // @ts-ignore
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
             // @ts-ignore
            await navigator.clipboard.write([clipboardItem]);
            toast({ title: 'Image Copied!', description: 'Open WhatsApp and paste the image.' });
          } else {
            window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
            toast({ title: 'Sharing to WhatsApp', description: 'Please paste the image from your gallery or try downloading first.'});
          }
          break;
        case 'viber':
          // Viber also has limitations with data URIs in direct share links.
          if (navigator.clipboard && typeof navigator.clipboard.write === 'function') {
             // @ts-ignore
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
             // @ts-ignore
            await navigator.clipboard.write([clipboardItem]);
            toast({ title: 'Image Copied!', description: 'Open Viber and paste the image.' });
          } else {
            toast({ title: 'Sharing to Viber', description: 'Please try copying or downloading the image first.' });
          }
          break;
        case 'instagram':
          if (navigator.clipboard && typeof navigator.clipboard.write === 'function') {
            // @ts-ignore
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
             // @ts-ignore
            await navigator.clipboard.write([clipboardItem]);
            toast({ title: 'Image Copied!', description: 'Open Instagram and paste the image into your story or post.' });
          } else {
             throw new Error('Clipboard API not fully supported for image copying.');
          }
          break;
      }
    } catch (err) {
      console.error(`Error sharing to ${platform}:`, err);
      toast({
        title: `Share to ${platform} Failed`,
        description: `Could not initiate share. Please try downloading the image. Reason: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
                <div className="flex md:hidden items-center justify-center my-2">
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
          <div className="flex flex-col items-center gap-4 pt-6">
            <Button onClick={handleDownload} variant="outline" size="lg" className="w-full max-w-xs">
              <Download className="mr-2 h-5 w-5" /> Download Image
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="w-full max-w-xs">
                  <Share2 className="mr-2 h-5 w-5" /> Share Image
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="flex items-center justify-center p-2 gap-2">
                <DropdownMenuItem 
                  onClick={() => handleSocialShare('telegram')} 
                  className="p-2 rounded-md hover:bg-accent focus:bg-accent cursor-pointer"
                  aria-label="Share to Telegram"
                >
                  <Send className="h-6 w-6" />
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSocialShare('whatsapp')}
                  className="p-2 rounded-md hover:bg-accent focus:bg-accent cursor-pointer"
                  aria-label="Share to WhatsApp"
                >
                  <WhatsAppLogo className="h-6 w-6" />
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSocialShare('viber')}
                  className="p-2 rounded-md hover:bg-accent focus:bg-accent cursor-pointer"
                  aria-label="Share to Viber"
                >
                   <ViberLogo className="h-6 w-6" />
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSocialShare('instagram')}
                  className="p-2 rounded-md hover:bg-accent focus:bg-accent cursor-pointer"
                  aria-label="Share to Instagram"
                >
                  <InstagramIcon className="h-6 w-6" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
