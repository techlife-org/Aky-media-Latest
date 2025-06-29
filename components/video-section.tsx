export default function VideoSection() {
  return (
    <section
      className="py-20 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/placeholder.svg?height=600&width=1200)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/iLVYuItS8e0?si=zT6kdOX7h62MGGNF"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
