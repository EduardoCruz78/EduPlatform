// === File: /backend/EduPlatform.Api/Controllers/ThumbnailController.cs ===

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThumbnailController : ControllerBase
{
    private readonly IHttpClientFactory _httpFactory;

    public ThumbnailController(IHttpClientFactory httpFactory)
    {
        _httpFactory = httpFactory;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest("Missing url parameter.");

        // 1) YouTube: quick deterministic thumbnail URL
        var ytId = ExtractYouTubeId(url);
        if (!string.IsNullOrEmpty(ytId))
        {
            var thumb = $"https://img.youtube.com/vi/{ytId}/hqdefault.jpg";
            return Ok(new { thumbnailUrl = thumb });
        }

        // 2) Vimeo: query oEmbed to get thumbnail_url
        var vimeoId = ExtractVimeoId(url);
        if (!string.IsNullOrEmpty(vimeoId))
        {
            try
            {
                var client = _httpFactory.CreateClient();
                var oembedUrl = $"https://vimeo.com/api/oembed.json?url={Uri.EscapeDataString(url)}";
                var body = await client.GetStringAsync(oembedUrl);
                using var doc = JsonDocument.Parse(body);
                if (doc.RootElement.TryGetProperty("thumbnail_url", out var t))
                {
                    var thumbUrl = t.GetString();
                    if (!string.IsNullOrEmpty(thumbUrl))
                        return Ok(new { thumbnailUrl = thumbUrl });
                }
            }
            catch (Exception ex)
            {
                // fallback to continue to ffmpeg generation
                Console.Error.WriteLine($"[ThumbnailController] Vimeo oembed failed: {ex.Message}");
            }
        }

        // 3) Generic: try to download and extract a frame using ffmpeg
        // NOTE: requires ffmpeg installed and in PATH on the machine running this API.
        try
        {
            var http = _httpFactory.CreateClient();
            http.Timeout = TimeSpan.FromSeconds(60);

            // create temp files with extensions
            var tmpVideo = Path.Combine(Path.GetTempPath(), $"video_{Guid.NewGuid()}.tmp");
            var tmpImage = Path.Combine(Path.GetTempPath(), $"thumb_{Guid.NewGuid()}.png");

            // download the file (stream)
            using (var resp = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead))
            {
                if (!resp.IsSuccessStatusCode) return BadRequest($"Failed to download video ({(int)resp.StatusCode}).");

                await using (var fs = System.IO.File.Create(tmpVideo))
                {
                    await resp.Content.CopyToAsync(fs);
                }
            }

            // run ffmpeg to capture a frame at 2s (or start)
            // ffmpeg -y -ss 00:00:02 -i input -frames:v 1 -vf scale=640:-1 output.png
            var startInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg",
                Arguments = $"-y -ss 00:00:02 -i \"{tmpVideo}\" -frames:v 1 -vf scale=640:-1 \"{tmpImage}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            var p = Process.Start(startInfo);
            string err = await p.StandardError.ReadToEndAsync();
            await p.WaitForExitAsync();

            if (!System.IO.File.Exists(tmpImage))
            {
                // cleanup
                TryDelete(tmpVideo);
                TryDelete(tmpImage);
                Console.Error.WriteLine("[ThumbnailController] ffmpeg failed: " + err);
                return Problem("Failed to create thumbnail via ffmpeg.");
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(tmpImage);
            var base64 = Convert.ToBase64String(bytes);
            var dataUrl = $"data:image/png;base64,{base64}";

            // cleanup temp files
            TryDelete(tmpVideo);
            TryDelete(tmpImage);

            return Ok(new { thumbnailDataUrl = dataUrl });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[ThumbnailController] Error generating thumbnail: {ex}");
            return Problem($"Error generating thumbnail: {ex.Message}");
        }
    }

    private static void TryDelete(string path)
    {
        try { if (System.IO.File.Exists(path)) System.IO.File.Delete(path); } catch { }
    }

    private static string? ExtractYouTubeId(string url)
    {
        try
        {
            // common youtube patterns
            var ytRegex = new System.Text.RegularExpressions.Regex(@"(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            var m = ytRegex.Match(url);
            if (m.Success) return m.Groups[1].Value;

            var u = new Uri(url);
            var q = System.Web.HttpUtility.ParseQueryString(u.Query);
            var v = q.Get("v");
            if (!string.IsNullOrEmpty(v) && v.Length == 11) return v;
        }
        catch { }
        return null;
    }

    private static string? ExtractVimeoId(string url)
    {
        try
        {
            // simplest numeric id match
            var vimeoRegex = new System.Text.RegularExpressions.Regex(@"vimeo\.com\/(?:.*\/)?([0-9]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            var m = vimeoRegex.Match(url);
            if (m.Success) return m.Groups[1].Value;
        }
        catch { }
        return null;
    }
}
