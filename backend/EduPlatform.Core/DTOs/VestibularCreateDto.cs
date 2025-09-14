namespace EduPlatform.Core.DTOs;

public class VestibularCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Date { get; set; }
    public string? Description { get; set; }
    public string? Url { get; set; }
}