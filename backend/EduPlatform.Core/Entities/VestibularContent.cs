namespace EduPlatform.Core.Entities;

public class VestibularContent
{
    public int Id { get; set; }

    // conteúdo específico do vestibular (pode ser um novo conteúdo ou uma cópia)
    public string Title { get; set; } = string.Empty;
    public string? Type { get; set; }   // Video, Exercise, Simulated
    public string? Link { get; set; }
    public string? PdfUrl { get; set; }

    // referência opcional ao conteúdo original (quando é "compartilhado")
    public int? OriginalContentId { get; set; }
    public Content? OriginalContent { get; set; }

    // referência opcional ao tópico de origem (caso queira saber)
    public int? OriginalTopicId { get; set; }

    public int VestibularId { get; set; }
    public Vestibular Vestibular { get; set; } = null!;
}
