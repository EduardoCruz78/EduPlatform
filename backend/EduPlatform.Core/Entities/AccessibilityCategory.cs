public class AccessibilityCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<AccessibilityCategoryTopic> CategoryTopics { get; set; } = new List<AccessibilityCategoryTopic>();

    // nova coleção de temas (conteúdos / instruções)
    public ICollection<AccessibilityTheme> Themes { get; set; } = new List<AccessibilityTheme>();
}