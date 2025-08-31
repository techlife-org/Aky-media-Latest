import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Audio tracks from the audio page
const audioTracks = [
  {
    _id: "audio_1",
    title: "Ko Hasidin",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/koHasidin.mp3",
    duration: 381, // 06:21 in seconds
    coverImageUrl: "/pictures/logo1.png",
    playCount: 1250,
    likes: 89,
    status: "active"
  },
  {
    _id: "audio_2",
    title: "Kareemi",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/kareemi.mp3",
    duration: 663, // 11:03 in seconds
    coverImageUrl: "/pictures/logo1.png",
    playCount: 980,
    likes: 67,
    status: "active"
  },
  {
    _id: "audio_3",
    title: "Abba Gida Gida",
    artist: "AKY Media",
    genre: "Billy-o",
    audioUrl: "https://archive.org/download/aky_20250624/abbaBilly.mp3",
    duration: 663,
    coverImageUrl: "/pictures/logo1.png",
    playCount: 1100,
    likes: 78,
    status: "active"
  },
  {
    _id: "audio_4",
    title: "Allah ga Abba (Ali Jita, Ado Gwanja)",
    artist: "Ali Jita & Ado Gwanja",
    genre: "Ali Jita & Ado Gwanja",
    audioUrl: "https://archive.org/download/aky_20250624/allahGaAbba.mp3",
    duration: 663,
    coverImageUrl: "/pictures/logo1.png",
    playCount: 1500,
    likes: 120,
    status: "active"
  },
  {
    _id: "audio_5",
    title: "Dan Farin Gida",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/danFarinGida.mp3",
    duration: 783, // 13:03
    coverImageUrl: "/pictures/logo1.png",
    playCount: 890,
    likes: 56,
    status: "active"
  },
  {
    _id: "audio_6",
    title: "Lamba Daya",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/lambaDaya.mp3",
    duration: 312, // 5:12
    coverImageUrl: "/pictures/logo1.png",
    playCount: 750,
    likes: 45,
    status: "active"
  },
  {
    _id: "audio_7",
    title: "Hasbunallahu",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/hasbunallahu.mp3",
    duration: 310, // 5:10
    coverImageUrl: "/pictures/logo1.png",
    playCount: 680,
    likes: 42,
    status: "active"
  },
  {
    _id: "audio_8",
    title: "Sakona",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/sakoNa.mp3",
    duration: 248, // 4:08
    coverImageUrl: "/pictures/logo1.png",
    playCount: 590,
    likes: 38,
    status: "active"
  },
  {
    _id: "audio_9",
    title: "Sunaji suna gani",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/sunaJiSunaGani.mp3",
    duration: 359, // 5:59
    coverImageUrl: "/pictures/logo1.png",
    playCount: 720,
    likes: 48,
    status: "active"
  },
  {
    _id: "audio_10",
    title: "Ga Comrade ga Abba",
    artist: "AKY Media",
    genre: "Tijjani Gandu",
    audioUrl: "https://archive.org/download/aky_20250624/gaAbbaGaComrd.mp3",
    duration: 386, // 6:26
    coverImageUrl: "/pictures/logo1.png",
    playCount: 820,
    likes: 52,
    status: "active"
  }
];

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // Get music from database
    const dbMusic = await db.collection('music')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray();

    // Combine database music with audio tracks
    const allMusic = [...audioTracks, ...dbMusic];

    return NextResponse.json({
      success: true,
      data: allMusic
    });

  } catch (error) {
    console.error('Error fetching music for youth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}