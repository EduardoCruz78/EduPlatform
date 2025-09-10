// === File: /backend/EduPlatform.Core/Entities/Series.cs ===
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.Core.Entities;

public class Series
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Subject> Subjects { get; set; } = new();
}