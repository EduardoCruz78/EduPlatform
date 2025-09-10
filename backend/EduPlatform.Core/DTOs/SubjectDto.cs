// === File: /backend/EduPlatform.Core/DTOs/SubjectDto.cs ===
namespace EduPlatform.Core.DTOs;

public class SubjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? SeriesId { get; set; }
}