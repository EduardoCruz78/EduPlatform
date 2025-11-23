// === File: /backend/EduPlatform.Core/Entities/User.cs ===

namespace EduPlatform.Core.Entities;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // Provider-specific id (Google sub)
    public string ProviderId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public List<Checklist> Checklists { get; set; } = new();
}
