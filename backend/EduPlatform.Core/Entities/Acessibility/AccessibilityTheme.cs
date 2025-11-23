namespace EduPlatform.Core.Entities;

public class AccessibilityTheme
{
    public int Id { get; set; }
    public int AccessibilityCategoryId { get; set; }
    public AccessibilityCategory AccessibilityCategory { get; set; } = null!;

    public string Title { get; set; } = "";
    public string? Content { get; set; }
}