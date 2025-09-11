import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id

    // Create a simple demo video stream response
    // This creates an MP4 video with a simple animation
    const canvas = `
      <canvas id="canvas" width="1280" height="720"></canvas>
      <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        let frame = 0;
        
        function animate() {
          // Create gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#dc2626');
          gradient.addColorStop(1, '#991b1b');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('AKY Media Center', canvas.width / 2, canvas.height / 2 - 50);
          
          ctx.font = '32px Arial';
          ctx.fillText('Live Broadcast Demo', canvas.width / 2, canvas.height / 2 + 20);
          
          // Animated pulse effect
          const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;
          ctx.fillStyle = \`rgba(255, 255, 255, \${pulse})\`;
          ctx.font = '24px Arial';
          ctx.fillText('🔴 LIVE', canvas.width / 2, canvas.height / 2 + 80);
          
          // Add timestamp
          ctx.font = '16px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height - 50);
          
          frame++;
          requestAnimationFrame(animate);
        }
        
        animate();
      </script>
    `;

    // For a real implementation, you would stream actual video data
    // For now, return a response that indicates this is a demo stream
    return new NextResponse(
      JSON.stringify({
        success: true,
        broadcastId,
        streamType: "demo",
        message: "Demo stream active",
        timestamp: new Date().toISOString(),
        // In a real implementation, this would be binary video data
        demoContent: {
          type: "animated_canvas",
          resolution: "1280x720",
          fps: 30,
          format: "webm"
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )

  } catch (error) {
    console.error("Demo stream error:", error)
    return NextResponse.json(
      { 
        message: "Demo stream error", 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}