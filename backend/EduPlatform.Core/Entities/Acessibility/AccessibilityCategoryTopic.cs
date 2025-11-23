namespace EduPlatform.Core.Entities;

public class AccessibilityCategoryTopic
{
    public int AccessibilityCategoryId { get; set; }
    public AccessibilityCategory AccessibilityCategory { get; set; } = null!;

    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}