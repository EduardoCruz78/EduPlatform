// === File: /backend/EduPlatform.Core/DTOs/ContentDto.cs ===
namespace EduPlatform.Core.DTOs;

public class ContentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;

    public int TopicId { get; set; }
}