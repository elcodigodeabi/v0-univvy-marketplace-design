import Image from "next/image"

interface AvatarDisplayProps {
  src?: string | null
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: { height: 32, width: 32 },
  md: { height: 48, width: 48 },
  lg: { height: 80, width: 80 },
  xl: { height: 128, width: 128 },
}

export function AvatarDisplay({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
}: AvatarDisplayProps) {
  const { height, width } = sizeMap[size]
  const displaySrc = src || "/avatar-default.png"

  return (
    <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      <Image
        src={displaySrc}
        alt={alt}
        height={height}
        width={width}
        className="object-cover"
        unoptimized={displaySrc.startsWith("blob:") ? true : false}
      />
    </div>
  )
}
