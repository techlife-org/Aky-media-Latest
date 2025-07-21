export function getYouTubeId(url: string): string | null {
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i
    const match = url.match(regExp)
    return match && match[1].length === 11 ? match[1] : null
  }
  
  export function getYouTubeEmbedUrl(videoId: string, autoplay = false, mute = false): string {
    const params = new URLSearchParams()
    params.append("controls", "1")
    params.append("showinfo", "0")
    params.append("rel", "0")
    params.append("modestbranding", "1")
    if (autoplay) params.append("autoplay", "1")
    if (mute) params.append("mute", "1")
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
  }
  
  export function getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
  
  export function isYouTubeUrl(url: string): boolean {
    return getYouTubeId(url) !== null
  }
  