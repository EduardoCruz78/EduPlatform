// === File: /backend/EduPlatform.Core/Entities/TopicSubject.cs ===

namespace EduPlatform.Core.Entities.Series;

public class TopicSubject
{
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;

    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
}