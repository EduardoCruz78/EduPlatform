// === File: /backend/EduPlatform.Core/DTOs/TopicCreateDto.cs ===
using System.Collections.Generic;

namespace EduPlatform.Core.DTOs;

public class TopicCreateDto
{
    // aceitar tanto "name" quanto "title" do frontend
    public string? Name { get; set; }
    public string? Title { get => Name; set => Name = value; }

    // opcional: um subjectId único (quando criar ligado a uma matéria)
    public int? SubjectId { get; set; }

    // opcional: lista de subjectIds (se quiser ligar o mesmo tópico a várias matérias)
    public List<int>? SubjectIds { get; set; }
}