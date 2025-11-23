namespace EduPlatform.Core.DTOs;

public class ContentCreateDto
{
    public string? Title { get; set; }
    public string? Type { get; set; } // "Video" | "Exercise" | "Simulated"
    public string? Link { get; set; } // opcional agora
    public string? ThumbnailUrl { get; set; }
    public string? PdfUrl { get; set; }
    public int TopicId { get; set; }
}