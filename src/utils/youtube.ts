export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
}

export async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

  if (!YOUTUBE_API_KEY) {
    throw new Error(
      "YouTube API Key is missing. Please check your environment variables."
    );
  }

  if (!CHANNEL_ID) {
    throw new Error(
      "YouTube Channel ID is missing. Please check your environment variables."
    );
  }

  try {
    console.log("Fetching videos for channel:", CHANNEL_ID);

    let allVideos: YouTubeVideo[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      // Fetch video IDs with pagination
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=id&type=video&order=date&maxResults=50${
          nextPageToken ? `&pageToken=${nextPageToken}` : ""
        }`
      );

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error("YouTube API Error:", errorData);
        throw new Error(
          `Failed to fetch YouTube videos: ${searchResponse.status} ${searchResponse.statusText}`
        );
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || !Array.isArray(searchData.items)) {
        console.error("Unexpected API response format:", searchData);
        throw new Error("Invalid API response format");
      }

      const videoIds = searchData.items
        .map((item: any) => item.id.videoId)
        .join(",");

      // Fetch video details including duration
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=snippet,contentDetails`
      );

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        console.error("YouTube API Error:", errorData);
        throw new Error(
          `Failed to fetch video details: ${videoResponse.status} ${videoResponse.statusText}`
        );
      }

      const videoData = await videoResponse.json();

      if (!videoData.items || !Array.isArray(videoData.items)) {
        console.error("Unexpected API response format:", videoData);
        throw new Error("Invalid API response format");
      }

      const videos = videoData.items
        .map((item: any) => ({
          videoId: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          publishedAt: item.snippet.publishedAt,
          duration: item.contentDetails.duration,
        }))
        .filter((video: YouTubeVideo) => {
          const durationInSeconds = parseDuration(video.duration);
          return durationInSeconds > 180; // Filter videos longer than 3 minutes
        });

      allVideos = [...allVideos, ...videos];
      nextPageToken = searchData.nextPageToken;
    } while (nextPageToken);

    console.log(`Found ${allVideos.length} videos longer than 3 minutes`);

    return allVideos;
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    throw error;
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match?.[1] ?? "0") || 0;
  const minutes = parseInt(match?.[2] ?? "0") || 0;
  const seconds = parseInt(match?.[3] ?? "0") || 0;
  return hours * 3600 + minutes * 60 + seconds;
}
