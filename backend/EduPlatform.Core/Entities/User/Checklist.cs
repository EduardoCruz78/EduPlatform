// === File: /backend/EduPlatform.Core/Entities/Checklist.cs ===

namespace EduPlatform.Core.Entities;

public class Checklist
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int ContentId { get; set; }
    public Content Content { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}