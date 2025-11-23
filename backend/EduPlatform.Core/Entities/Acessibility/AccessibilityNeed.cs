namespace EduPlatform.Core.Entities;

public class AccessibilityNeed
{
    public int Id { get; set; }
    public int AccessibilityCategoryId { get; set; }
    public AccessibilityCategory AccessibilityCategory { get; set; } = null!;

    public string Name { get; set; } = ""; // ex: "Deficiência Visual", "Autismo", "Deficiência Auditiva"
    public ICollection<AccessibilityTheme> Themes { get; set; } = new List<AccessibilityTheme>();
}
