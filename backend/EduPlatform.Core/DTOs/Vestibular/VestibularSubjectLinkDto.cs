namespace EduPlatform.Core.DTOs;

// VestibularSubjectLinkDto.cs
public class VestibularSubjectLinkDto
{
    // Se informado, vincula matéria existente.
    public int? SubjectId { get; set; }

    // Se SubjectId não informado, cria nova matéria com esse Name.
    public string? Name { get; set; }
}