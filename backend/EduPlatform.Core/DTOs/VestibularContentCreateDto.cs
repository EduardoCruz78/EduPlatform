namespace EduPlatform.Core.DTOs;

public class VestibularContentCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Link { get; set; }
    public string? PdfUrl { get; set; }
    public int? OriginalContentId { get; set; }
}
