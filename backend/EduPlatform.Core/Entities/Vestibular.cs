namespace EduPlatform.Core.Entities;

public class Vestibular
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Informação de data/observação (string por flexibilidade)
    public string? Date { get; set; }

    // descrição adicional (agora existe)
    public string? Description { get; set; }

    public string? Url { get; set; }

    public ICollection<VestibularSubject> VestibularSubjects { get; set; } = new List<VestibularSubject>();
    public ICollection<VestibularContent> Contents { get; set; } = new List<VestibularContent>();
}