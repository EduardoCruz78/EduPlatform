using System.Collections.Generic;

namespace EduPlatform.Core.DTOs;

public class TopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Primeiro subjectId (útil para formulário que escolhe 1 matéria)
    public int? SubjectId { get; set; }

    // Lista de matérias ligadas (id, name, seriesId)
    public List<SubjectDto>? Subjects { get; set; }
}