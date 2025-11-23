namespace EduPlatform.Core.Entities;

public class AccessibilityCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }

    // ligações
    public ICollection<AccessibilityCategoryTopic> CategoryTopics { get; set; } = new List<AccessibilityCategoryTopic>();
    public ICollection<AccessibilityTheme> Themes { get; set; } = new List<AccessibilityTheme>();
}