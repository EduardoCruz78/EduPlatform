namespace EduPlatform.Core.DTOs;

public class AccessibilityThemeDto
{
    public int Id { get; set; }
    public int AccessibilityCategoryId { get; set; }
    public string Title { get; set; } = "";
    public string? Content { get; set; }
}