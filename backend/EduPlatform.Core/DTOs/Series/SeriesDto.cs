// === File: /backend/EduPlatform.Core/DTOs/SeriesDto.cs ===

namespace EduPlatform.Core.DTOs;

public class SeriesDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    
    public List<SubjectDto> Subjects { get; set; } = new();
}