/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */

import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ImageUploadCropInputProps {
  value?: string | null;
  onChange: (croppedImage: string) => void;
  className?: string;
  previewClassName?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ImageUploadCropInput({
  value,
  onChange,
  className,
  previewClassName,
  disabled = false,
  placeholder = "Sem ícone",
}: ImageUploadCropInputProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedPixels: any) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImage = async (): Promise<string | null> => {
    if (!(imageSrc && croppedAreaPixels)) {
      return null;
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    const { width, height, x, y } = croppedAreaPixels;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg");
  };

  const handleCropConfirm = async () => {
    const cropped = await getCroppedImage();
    if (cropped) {
      onChange(cropped);
    }

    // resetar modal
    setIsOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground text-xs",
            previewClassName,
            className
          )}
        >
          {value ? (
            <>
              <img
                alt="Ícone"
                className="h-full w-full object-cover"
                src={value}
              />
              <Button
                aria-label="Remover imagem"
                className="absolute top-0 right-0 z-10 h-7 w-7 rounded-full bg-amber-500 bg-opacity-50 p-1 text-white hover:bg-opacity-75"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                size={"sm"}
                title="Remover imagem"
                variant={"ghost"}
              >
                <X />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
              <span>{placeholder}</span>
            </div>
          )}

          {/* Input invisível para seleção de imagem */}
          <input
            accept="image/*"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            disabled={disabled}
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />
        </div>
      </DialogTrigger>

      <DialogContent className="h-[450px] w-full max-w-lg">
        <div className="relative h-80 w-full bg-gray-100">
          <Cropper
            aspect={1}
            crop={crop}
            image={imageSrc!}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            zoom={zoom}
          />
        </div>

        <div className="mt-2 flex items-center gap-5">
          <Slider
            max={3}
            min={1}
            onValueChange={(v) => setZoom(v[0])}
            step={0.1}
            value={[zoom]}
          />
          <Button onClick={handleCropConfirm}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
