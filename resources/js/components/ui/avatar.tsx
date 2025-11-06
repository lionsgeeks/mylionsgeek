import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { useInitials } from "@/hooks/use-initials"; // Assuming this is your custom hook

// Function to determine if the user is online
const isUserOnline = (lastActivity: string | null) => {
  if (!lastActivity) return false;
  const now = new Date();
  const lastActiveTime = new Date(lastActivity);
  const diffInMinutes = (now.getTime() - lastActiveTime.getTime()) / (1000 * 60); // Time difference in minutes
  return diffInMinutes <= 5; // Consider user online if last activity was within the last 5 minutes
};

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  image?: string;
  name: string;
  lastActivity: string | null;
  onlineCircleClass?: string; // Accept custom class for online status circle
}

function Avatar({
  className,
  image,
  name,
  lastActivity,
  onlineCircleClass = "w-4 h-4", // Default class for online circle size
  ...props
}: AvatarProps) {
  const getInitials = useInitials(); // Getting initials via the hook

  // Determine if the user is online based on last activity
  const onlineStatus = isUserOnline(lastActivity);

  return (
    <div className="relative z-0">
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {image ? (
          <AvatarImage src={`/storage/img/profile/${image}`} alt={name} />
        ) : (
          <AvatarFallback className="rounded-lg  bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
            {getInitials(name)}
          </AvatarFallback>
        )}
      </AvatarPrimitive.Root>

      {/* Render the online indicator with dynamic size */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1 rounded-full border-2 border-white",
          onlineStatus ? "bg-green-500" : "bg-neutral-500",
          onlineCircleClass // Apply the custom class for online status circle size and position
        )}
      />
    </div>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full object-cover bg-top", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
