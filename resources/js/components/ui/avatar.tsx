import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { useInitials } from "@/hooks/use-initials";

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  image?: string;
  edit?: boolean;
  name: string;
  lastActivity?: string | null;
  onlineCircleClass?: string;
}

// Determine if the user is online (within last 5 minutes)
const isUserOnline = (lastActivity?: string | null) => {
  if (!lastActivity) return false;
  const diff = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60);
  return diff <= 5;
};

function Avatar({
  image,
  edit = false,
  name,
  lastActivity,
  onlineCircleClass = "w-4 h-4",
  className,
  ...props
}: AvatarProps) {
  const getInitials = useInitials();
  const online = isUserOnline(lastActivity);

  return (
    <div className="relative group w-fit">
      <AvatarPrimitive.Root
        className={cn("relative flex shrink-0 overflow-hidden rounded-full", className)}
        {...props}
      >
        {image ? (
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <AvatarPrimitive.Image
              src={`/storage/img/profile/${image}`}
              alt={name}
              className="w-full h-full object-cover border-2 border-dark object-[50%_30%] rounded-full"
            />
            {/* Dark overlay when edit */}
            {edit && (
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </div>
        ) : (
          <AvatarPrimitive.Fallback className="flex items-center justify-center w-full h-full rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
            {getInitials(name)}
          </AvatarPrimitive.Fallback>
        )}
      </AvatarPrimitive.Root>

      {/* Online indicator */}
      {lastActivity && (
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
