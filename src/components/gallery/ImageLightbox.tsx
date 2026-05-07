"use client";
import * as React from "react";
import Image from "next/image";
import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { PromptImage } from "@/lib/types";

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: PromptImage;
  title: string;
}

export function ImageLightbox({ open, onOpenChange, image, title }: ImageLightboxProps) {
  const aspect = image.width && image.height ? image.width / image.height : 1;
  const alt = image.alt_text || title;

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <RDialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 focus:outline-none data-[state=open]:animate-fade-in"
          onClick={() => onOpenChange(false)}
        >
          <RDialog.Title className="sr-only">{title}</RDialog.Title>
          <div
            className="relative max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ aspectRatio: aspect }}
          >
            <Image
              src={image.url}
              alt={alt}
              width={image.width ?? 1600}
              height={image.height ?? 1600}
              sizes="100vw"
              className="h-auto max-h-[92vh] w-auto max-w-[92vw] rounded-lg object-contain shadow-2xl"
              priority
            />
          </div>
          <RDialog.Close
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </RDialog.Close>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
