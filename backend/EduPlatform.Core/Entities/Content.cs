// === File: /backend/EduPlatform.Core/Entities/Content.cs ===
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.Core.Entities;

public class Content
{
    [Key]
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;

    // e.g., Video, Exercise, Simulated
    public string Type { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;

    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}