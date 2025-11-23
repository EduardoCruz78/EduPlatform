namespace EduPlatform.Core.DTOs;

public class VestibularContentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Link { get; set; }
    public string? PdfUrl { get; set; }
    public int VestibularId { get; set; }
}