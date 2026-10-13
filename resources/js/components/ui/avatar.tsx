import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { useInitials } from "@/hooks/use-initials";

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  /** Profile filename (e.g. hashed upload) under storage/img/profile */
  image?: string;
  /** Full URL override (e.g. auth.user.avatarUrl) */
  src?: string;
  edit?: boolean;
  name: string;
  lastActivity?: string | null;
  isOnline?: boolean;
  onlineCircleClass?: string;
}

// Determine if the user is online (within last 5 minutes)
const isUserOnline = (lastActivity?: string | null) => {
  if (!lastActivity) return false;
  const diff = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60);
  return diff <= 5;
};

function resolveAvatarImageSrc(image?: string, src?: string): string | undefined {
  if (src) {
    return src;
  }
  if (!image) {
    return undefined;
  }
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/storage/")) {
    return image;
  }
  if (image.includes("img/profile/")) {
    return `/storage/${image.replace(/^\/+/, "")}`;
  }
  return `/storage/img/profile/${image.replace(/^\/+/, "")}`;
}

function Avatar({
  image,
  src,
  edit = false,
  name,
  lastActivity,
  isOnline,
  onlineCircleClass = "w-4 h-4",
  className,
  ...props
}: AvatarProps) {
  const getInitials = useInitials();
  const online = typeof isOnline === "boolean" ? isOnline : isUserOnline(lastActivity);
  const shouldShowIndicator = typeof isOnline === "boolean" || Boolean(lastActivity);
  const resolvedSrc = resolveAvatarImageSrc(image, src);

  return (
    <div className="relative z-0 inline-flex shrink-0 group">
      <AvatarPrimitive.Root
        className={cn(
          "relative flex aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-dark",
          className,
        )}
        {...props}
      >
        {resolvedSrc ? (
          <AvatarPrimitive.Image
            src={resolvedSrc}
            alt={name}
            className="aspect-square size-full object-cover"
          />
        ) : null}
        <AvatarPrimitive.Fallback className="flex size-full items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-black dark:bg-neutral-700 dark:text-white">
          {getInitials(name)}
        </AvatarPrimitive.Fallback>
        {edit && resolvedSrc ? (
          <div className="pointer-events-none absolute inset-0 rounded-full bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        ) : null}
      </AvatarPrimitive.Root>

      {/* Online indicator */}
      {shouldShowIndicator && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full border-2 border-white",
            online ? "bg-green-500" : "bg-neutral-500",
            onlineCircleClass
          )}
        />
      )}
    </div>
  );
}

export { Avatar };
