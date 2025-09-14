// === File: /backend/EduPlatform.Core/Entities/Subject.cs ===

namespace EduPlatform.Core.Entities;

public class Subject
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Optional relation to Series (many Subjects belong to a Series)
    public int? SeriesId { get; set; }
    public Series? Series { get; set; }

    // Many-to-many with Topic via TopicSubject
    public List<TopicSubject> TopicSubjects { get; set; } = new();
}