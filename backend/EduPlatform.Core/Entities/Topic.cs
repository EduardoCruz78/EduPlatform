// === File: /backend/EduPlatform.Core/Entities/Topic.cs ===
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.Core.Entities;

public class Topic
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Content> Contents { get; set; } = new();

    public List<TopicSubject> TopicSubjects { get; set; } = new();
}