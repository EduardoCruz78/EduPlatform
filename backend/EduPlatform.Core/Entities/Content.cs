using System.ComponentModel.DataAnnotations;

namespace EduPlatform.Core.Entities;

public class Content
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    // Tipo: "Video", "Exercise", "Simulated"...
    public string Type { get; set; } = "Video";

    // Agora opcionais (nullable) — permite criar Exercise sem Link
    public string? Link { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? PdfUrl { get; set; }

    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}