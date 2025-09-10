// === File: /backend/EduPlatform.Core/Entities/Vestibular.cs ===
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.Core.Entities;

public class Vestibular
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Subject> Subjects { get; set; } = new();
}